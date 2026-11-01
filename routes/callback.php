<?php

use App\Models\Locale;
use App\Models\User\User;
use App\Models\Order\Order;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\Deposit\Deposit;
use App\Models\Product\Product;
use App\Models\MobileNotification;
use App\Models\User\UserBalanceLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| Payment gateway callbacks
|--------------------------------------------------------------------------
| Keamanan (hardening 2026-11-01):
| 1. Callback hanya sah bila dipanggil lewat PATH RAHASIA yang dikonfigurasi
|    di prefix_callback_url masing-masing gateway. Prefix kosong/generik
|    ("callback", "notif-forwarder", dst.) = callback NONAKTIF (404). Tanpa
|    ini, siapa pun bisa memicu kredit saldo dengan menebak path.
| 2. Semua kredit saldo dibungkus DB::transaction + lockForUpdate dan hanya
|    diproses dari status 'pending' -> idempoten terhadap race condition
|    (dua callback paralel tidak bisa menggandakan kredit).
| 3. Verifikasi kredensial memakai hash_equals (anti timing attack).
*/

$gate = function (string $prefix): void {
    // Prefix kosong = gateway belum dikonfigurasi (route yang punya uri
    // fallback '/callback') -> callback nonaktif. Prefix generik yang
    // mudah ditebak juga ditolak. Prefix khusus yang dilindungi signature
    // (mis. 'flazpay' + md5 client_secret) tetap diizinkan.
    $p = trim($prefix, '/');
    if ($p === '' || in_array($p, ['callback', 'notif-forwarder', 'paydisini', 'tripay', 'tokopay', 'duitku', 'midtrans'], true)) {
        abort(404);
    }
};

Route::post(website_config('payment_gateway')->paydisini->prefix_callback_url, function (Request $request) use ($gate) {
    $gate((string) website_config('payment_gateway')->paydisini->prefix_callback_url);

    $response = $_POST;
    $apiKey = (string) website_config('payment_gateway')->paydisini->api_key;
    if ($apiKey === '' || !is_string($response['key'] ?? null) || !hash_equals($apiKey, (string) $response['key'])) {
        return response()->json([
            'success' => false,
        ], 400, [], JSON_PRETTY_PRINT);
    }

    $checkDeposit = Deposit::with('user')->where([
        ['payment_gateway_payment_id', $response['unique_code']],
        ['status', 'pending']
    ])->first();

    if ($checkDeposit) {
        $status = 'pending';
        if ($response['status'] == 'Success') $status = 'success';
        if ($response['status'] == 'Canceled') $status = 'canceled';

        if ($status != 'pending') {
            DB::transaction(function () use ($checkDeposit, $status) {
                $deposit = Deposit::with('user')->whereKey($checkDeposit->id)->lockForUpdate()->first();
                if (!$deposit || $deposit->status != 'pending') return;

                $deposit->update([
                    'status' => $status
                ]);

                if ($status == 'success') {
                    $initialBalance = $deposit->user->balance;
                    $finalBalance = $initialBalance + $deposit->total_balance;
                    $deposit->user->update([
                        'balance' => $finalBalance,
                    ]);
                    UserBalanceLog::create([
                        'user_id'         => $deposit->user_id,
                        'type'            => 'credit',
                        'category'        => 'deposit',
                        'amount'          => $deposit->total_balance,
                        'initial_balance' => $initialBalance,
                        'final_balance'   => $finalBalance,
                        'content_key'     => 'deposits:log.process-successful',
                        'content_params'  => (object) ['deposit_id' => $deposit->id],
                    ]);
                    if ($deposit->user->upline) {
                        $commissionAmount = ((website_config('affiliate')->commission / 100) * $deposit->amount);
                        $initialCommission = $deposit->user->upline->commission;
                        $finalCommission = $initialCommission + $commissionAmount;
                        $deposit->user->upline->update([
                            'commission' => $finalCommission,
                        ]);
                        UserBalanceLog::create([
                            'user_id'         => $deposit->user->upline->id,
                            'type'            => 'credit',
                            'category'        => 'commission',
                            'amount'          => $commissionAmount,
                            'initial_balance' => $initialCommission,
                            'final_balance'   => $finalCommission,
                            'content_key'     => 'affiliate:log.commission-received',
                            'content_params'  => (object) ['amount' => $commissionAmount, 'user' => $deposit->user->full_name],
                        ]);
                    }
                }
            });
        }

        return response()->json([
            'success' => true,
        ], 200, [], JSON_PRETTY_PRINT);
    }

    return response()->json([
        'success' => false,
    ], 400, [], JSON_PRETTY_PRINT);
});

Route::post(website_config('payment_gateway')->tripay->prefix_callback_url, function (Request $request) use ($gate) {
    $gate((string) website_config('payment_gateway')->tripay->prefix_callback_url);

    $response = json_decode(file_get_contents("php://input"), true);
    if (!is_array($response)) {
        return response()->json(['success' => false], 400, [], JSON_PRETTY_PRINT);
    }

    $checkDeposit = Deposit::with('user')->where([
        ['payment_gateway_payment_id', $response['merchant_ref'] ?? null],
        ['status', 'pending']
    ])->first();

    if ($checkDeposit) {
        $status = 'pending';
        if ($response['status'] == 'PAID') $status = 'success';
        if ($response['status'] == 'EXPIRED') $status = 'expired';
        if ($response['status'] == 'FAILED') $status = 'canceled';

        if ($status != 'pending') {
            DB::transaction(function () use ($checkDeposit, $status) {
                $deposit = Deposit::with('user')->whereKey($checkDeposit->id)->lockForUpdate()->first();
                if (!$deposit || $deposit->status != 'pending') return;

                $deposit->update([
                    'status' => $status
                ]);

                if ($status == 'success') {
                    $initialBalance = $deposit->user->balance;
                    $finalBalance = $initialBalance + $deposit->total_balance;
                    $deposit->user->update([
                        'balance' => $finalBalance,
                    ]);
                    UserBalanceLog::create([
                        'user_id'         => $deposit->user_id,
                        'type'            => 'credit',
                        'category'        => 'deposit',
                        'amount'          => $deposit->total_balance,
                        'initial_balance' => $initialBalance,
                        'final_balance'   => $finalBalance,
                        'content_key'     => 'deposits:log.process-successful',
                        'content_params'  => (object) ['deposit_id' => $deposit->id],
                    ]);
                    if ($deposit->user->upline) {
                        $commissionAmount = ((website_config('affiliate')->commission / 100) * $deposit->amount);
                        $initialCommission = $deposit->user->upline->commission;
                        $finalCommission = $initialCommission + $commissionAmount;
                        $deposit->user->upline->update([
                            'commission' => $finalCommission,
                        ]);
                        UserBalanceLog::create([
                            'user_id'         => $deposit->user->upline->id,
                            'type'            => 'credit',
                            'category'        => 'commission',
                            'amount'          => $commissionAmount,
                            'initial_balance' => $initialCommission,
                            'final_balance'   => $finalCommission,
                            'content_key'     => 'affiliate:log.commission-received',
                            'content_params'  => (object) ['amount' => $commissionAmount, 'user' => $deposit->user->full_name],
                        ]);
                    }
                }
            });
        }

        return response()->json([
            'success' => true,
        ], 200, [], JSON_PRETTY_PRINT);
    }

    return response()->json([
        'success' => false,
    ], 400, [], JSON_PRETTY_PRINT);
});

Route::post(website_config('payment_gateway')->tokopay->prefix_callback_url, function (Request $request) use ($gate) {
    $gate((string) website_config('payment_gateway')->tokopay->prefix_callback_url);

    $response = json_decode(file_get_contents("php://input"), true);
    if (!is_array($response)) {
        return response()->json(['success' => false], 400, [], JSON_PRETTY_PRINT);
    }

    $checkDeposit = Deposit::with('user')->where([
        ['payment_gateway_payment_id', $response['reff_id'] ?? null],
        ['status', 'pending']
    ])->first();

    if ($checkDeposit) {
        $status = 'pending';
        if ($response['status'] == 'Success') $status = 'success';
        if ($response['status'] == 'Completed') $status = 'success';
        if ($response['status'] == 'Canceled') $status = 'canceled';
        if ($response['status'] == 'Expired') $status = 'expired';

        if ($status != 'pending') {
            DB::transaction(function () use ($checkDeposit, $status) {
                $deposit = Deposit::with('user')->whereKey($checkDeposit->id)->lockForUpdate()->first();
                if (!$deposit || $deposit->status != 'pending') return;

                $deposit->update([
                    'status' => $status
                ]);

                if ($status == 'success') {
                    $initialBalance = $deposit->user->balance;
                    $finalBalance = $initialBalance + $deposit->total_balance;
                    $deposit->user->update([
                        'balance' => $finalBalance,
                    ]);
                    UserBalanceLog::create([
                        'user_id'         => $deposit->user_id,
                        'type'            => 'credit',
                        'category'        => 'deposit',
                        'amount'          => $deposit->total_balance,
                        'initial_balance' => $initialBalance,
                        'final_balance'   => $finalBalance,
                        'content_key'     => 'deposits:log.process-successful',
                        'content_params'  => (object) ['deposit_id' => $deposit->id],
                    ]);
                    if ($deposit->user->upline) {
                        $commissionAmount = ((website_config('affiliate')->commission / 100) * $deposit->amount);
                        $initialCommission = $deposit->user->upline->commission;
                        $finalCommission = $initialCommission + $commissionAmount;
                        $deposit->user->upline->update([
                            'commission' => $finalCommission,
                        ]);
                        UserBalanceLog::create([
                            'user_id'         => $deposit->user->upline->id,
                            'type'            => 'credit',
                            'category'        => 'commission',
                            'amount'          => $commissionAmount,
                            'initial_balance' => $initialCommission,
                            'final_balance'   => $finalCommission,
                            'content_key'     => 'affiliate:log.commission-received',
                            'content_params'  => (object) ['amount' => $commissionAmount, 'user' => $deposit->user->full_name],
                        ]);
                    }
                }
            });
        }

        return response()->json([
            'success' => true,
        ], 200, [], JSON_PRETTY_PRINT);
    }

    return response()->json([
        'success' => false,
    ], 400, [], JSON_PRETTY_PRINT);
});

Route::post(website_config('payment_gateway')->flazpay->prefix_callback_url, function (Request $request) use ($gate) {
    $gate((string) website_config('payment_gateway')->flazpay->prefix_callback_url);

    $flazpayCredentials = website_config('payment_gateway')->flazpay;
    $response = $request->input();
    $uniqueCode = $response['unique_code'] ?? null;
    $statusResponse = $response['status'] ?? null;
    $signature = $response['signature'] ?? null;
    if (!$flazpayCredentials || $flazpayCredentials->merchant_id == '' || $flazpayCredentials->client_id == '' || $flazpayCredentials->client_secret == '' || !is_string($uniqueCode) || !$uniqueCode || !is_string($signature) || !$signature || !$statusResponse) {
        return response()->json([
            'success' => false,
        ], 200, [], JSON_PRETTY_PRINT);
    }
    $expectedSignature = md5($flazpayCredentials->merchant_id . $flazpayCredentials->client_id . $flazpayCredentials->client_secret . $uniqueCode . 'CallbackStatus');
    if (!hash_equals($expectedSignature, $signature)) {
        return response()->json([
            'success' => false,
        ], 200, [], JSON_PRETTY_PRINT);
    }
    $status = 'pending';
    if ($statusResponse == 'Success') $status = 'success';
    if ($statusResponse == 'Canceled') $status = 'canceled';
    if ($statusResponse == 'Expired') $status = 'expired';
    if ($status != 'pending') {
        DB::transaction(function () use ($uniqueCode, $status) {
            $deposit = Deposit::with('user')->where('payment_gateway_payment_token', $uniqueCode)->lockForUpdate()->first();
            if (!$deposit || $deposit->status != 'pending') return;
            $deposit->update([
                'status' => $status
            ]);
            if ($status == 'success') {
                $initialBalance = $deposit->user->balance;
                $finalBalance = $initialBalance + $deposit->total_balance;
                $deposit->user->update([
                    'balance' => $finalBalance,
                ]);
                UserBalanceLog::create([
                    'user_id'         => $deposit->user_id,
                    'type'            => 'credit',
                    'category'        => 'deposit',
                    'amount'          => $deposit->total_balance,
                    'initial_balance' => $initialBalance,
                    'final_balance'   => $finalBalance,
                    'content_key'     => 'deposits:log.process-successful',
                    'content_params'  => (object) ['deposit_id' => $deposit->id],
                ]);
                if ($deposit->user->upline) {
                    $commissionAmount = ((website_config('affiliate')->commission / 100) * $deposit->amount);
                    $initialCommission = $deposit->user->upline->commission;
                    $finalCommission = $initialCommission + $commissionAmount;
                    $deposit->user->upline->update([
                        'commission' => $finalCommission,
                    ]);
                    UserBalanceLog::create([
                        'user_id'         => $deposit->user->upline->id,
                        'type'            => 'credit',
                        'category'        => 'commission',
                        'amount'          => $commissionAmount,
                        'initial_balance' => $initialCommission,
                        'final_balance'   => $finalCommission,
                        'content_key'     => 'affiliate:log.commission-received',
                        'content_params'  => (object) ['amount' => $commissionAmount, 'user' => $deposit->user->full_name],
                    ]);
                }
            }
        });
    }
    $checkDeposit = Deposit::where('payment_gateway_payment_token', $uniqueCode)->first();
    return response()->json([
        'success' => (bool) $checkDeposit,
    ], 200, [], JSON_PRETTY_PRINT);
});

Route::post(website_config('payment_gateway')->midtrans->prefix_callback_url, function (Request $request) use ($gate) {
    $gate((string) website_config('payment_gateway')->midtrans->prefix_callback_url);

    $response = json_decode(file_get_contents("php://input"), true);
    if (!is_array($response)) {
        return response()->json(['success' => false], 400, [], JSON_PRETTY_PRINT);
    }

    $checkDeposit = Deposit::with('user')->where([
        ['payment_gateway_payment_id', $response['order_id'] ?? null],
        ['status', 'pending']
    ])->first();

    if ($checkDeposit) {
        $status = 'pending';
        if ($response['transaction_status'] == 'settlement') $status = 'success';
        if ($response['transaction_status'] == 'capture') $status = 'success';
        if ($response['transaction_status'] == 'expired') $status = 'expired';
        if ($response['transaction_status'] == 'cancel') $status = 'canceled';
        if ($response['transaction_status'] == 'deny') $status = 'canceled';

        if ($status != 'pending') {
            DB::transaction(function () use ($checkDeposit, $status) {
                $deposit = Deposit::with('user')->whereKey($checkDeposit->id)->lockForUpdate()->first();
                if (!$deposit || $deposit->status != 'pending') return;

                $deposit->update([
                    'status' => $status
                ]);

                if ($status == 'success') {
                    $initialBalance = $deposit->user->balance;
                    $finalBalance = $initialBalance + $deposit->total_balance;
                    $deposit->user->update([
                        'balance' => $finalBalance,
                    ]);
                    UserBalanceLog::create([
                        'user_id'         => $deposit->user_id,
                        'type'            => 'credit',
                        'category'        => 'deposit',
                        'amount'          => $deposit->total_balance,
                        'initial_balance' => $initialBalance,
                        'final_balance'   => $finalBalance,
                        'content_key'     => 'deposits:log.process-successful',
                        'content_params'  => (object) ['deposit_id' => $deposit->id],
                    ]);
                    if ($deposit->user->upline) {
                        $commissionAmount = ((website_config('affiliate')->commission / 100) * $deposit->amount);
                        $initialCommission = $deposit->user->upline->commission;
                        $finalCommission = $initialCommission + $commissionAmount;
                        $deposit->user->upline->update([
                            'commission' => $finalCommission,
                        ]);
                        UserBalanceLog::create([
                            'user_id'         => $deposit->user->upline->id,
                            'type'            => 'credit',
                            'category'        => 'commission',
                            'amount'          => $commissionAmount,
                            'initial_balance' => $initialCommission,
                            'final_balance'   => $finalCommission,
                            'content_key'     => 'affiliate:log.commission-received',
                            'content_params'  => (object) ['amount' => $commissionAmount, 'user' => $deposit->user->full_name],
                        ]);
                    }
                }
            });
        }

        return response()->json([
            'success' => true,
        ], 200, [], JSON_PRETTY_PRINT);
    }

    return response()->json([
        'success' => false,
    ], 400, [], JSON_PRETTY_PRINT);
});

Route::get(website_config('prefix')->notif_forward, function (Request $request) {
    // Keamanan: endpoint ini memicu kredit saldo dari notifikasi HP. Tanpa
    // token, siapa pun bisa memalsukan mutasi. Wajib isi NOTIF_FORWARDER_TOKEN
    // di .env; bila kosong endpoint 404.
    $expectedToken = (string) config('services.notif_forwarder.token');
    if ($expectedToken === '' || !is_string($request->query('token')) || !hash_equals($expectedToken, (string) $request->query('token'))) {
        abort(404);
    }

    if (isset($request->pkg) && isset($request->bigtext)) {
        $locale = Locale::find(1);
        $payment = '';
        $amountIdr = 0;
        $packages = [
            'id.dana'                         => 'DANA',
            'ovo.id'                          => 'OVO',
            'com.shopeepay.id'                => 'SHOPEEPAY',
            'id.co.bankbkemobile.digitalbank' => 'SEABANK',
            'com.gojek.app'                   => 'GOPAY',
            'com.gojek.gopay'                 => 'GOPAY',
            'com.gojek.gopaymerchant'         => 'GOPAY',
        ];
        if (isset($packages[$request->pkg])) {
            $payment = $packages[$request->pkg];
            if (preg_match(
                '/(?:sebesar|sebanyak|menerima|diterima|masuk|pengisian saldo|transfer)\s+Rp\s?([\d\.]+)/i',
                $request->bigtext,
                $match
            )) {
                $amountIdr = (int) str_replace('.', '', $match[1]);
            } else {
                preg_match_all('/Rp\s?([\d\.]+)/', $request->bigtext, $matches);
                if (!empty($matches[1])) {
                    $amountIdr = (int) str_replace('.', '', $matches[1][0]);
                }
            }
            if ($payment === 'DANA' && Str::contains($request->bigtext, 'biaya admin')) {
                $amountIdr += 100;
            }
        }
        $rate = $locale->usd_rate;
        $amountUsd = bcdiv((string) $amountIdr, (string) $rate, 8);
        $minUsd = bcdiv($amountIdr, $rate, 8);
        $maxUsd = bcdiv(bcadd($amountIdr, '1'), $rate, 8);
        $checkMutation = MobileNotification::where([
            ['payment', $payment],
            ['amount', $amountUsd],
            ['content', $request->bigtext]
        ])->whereDate('created_at', date('Y-m-d'))->count();
        if ($checkMutation < 1 && $amountIdr !== 0) {
            $deposit = Deposit::with('user')->where('status', 'pending')
                ->whereBetween('total_payment', [$minUsd, $maxUsd])
                ->oldest()
                ->first();
            MobileNotification::create([
                'payment' => $payment,
                'amount'  => $amountUsd,
                'content' => $request->bigtext,
                'is_used' => $deposit ? 1 : 0,
            ]);
            if ($deposit) {
                DB::transaction(function () use ($deposit) {
                    $fresh = Deposit::with('user')->whereKey($deposit->id)->lockForUpdate()->first();
                    if (!$fresh || $fresh->status != 'pending') return;

                    $fresh->update([
                        'status' => 'success'
                    ]);
                    $initialBalance = $fresh->user->balance;
                    $finalBalance = $initialBalance + $fresh->total_balance;
                    $fresh->user->update([
                        'balance' => $finalBalance,
                    ]);
                    UserBalanceLog::create([
                        'user_id'         => $fresh->user_id,
                        'type'            => 'credit',
                        'category'        => 'deposit',
                        'amount'          => $fresh->total_balance,
                        'initial_balance' => $initialBalance,
                        'final_balance'   => $finalBalance,
                        'content_key'     => 'deposits:log.process-successful',
                        'content_params'  => (object) ['deposit_id' => $fresh->id],
                    ]);
                    if ($fresh->user->upline) {
                        $commissionAmount = ((website_config('affiliate')->commission / 100) * $fresh->amount);
                        $initialCommission = $fresh->user->upline->commission;
                        $finalCommission = $initialCommission + $commissionAmount;
                        $fresh->user->upline->update([
                            'commission' => $finalCommission,
                        ]);
                        UserBalanceLog::create([
                            'user_id'         => $fresh->user->upline->id,
                            'type'            => 'credit',
                            'category'        => 'commission',
                            'amount'          => $commissionAmount,
                            'initial_balance' => $initialCommission,
                            'final_balance'   => $finalCommission,
                            'content_key'     => 'affiliate:log.commission-received',
                            'content_params'  => (object) ['amount' => $commissionAmount, 'user' => $fresh->user->full_name],
                        ]);
                    }
                });
                print_r('Berhasil! Mutasi ditambahkan kedalam database. <br />');
            } else {
                print_r('Mutasi dicatat (menunggu deposit cocok). <br />');
            }
        } else {
            print_r('Gagal! Mutasi sudah ada didalam database. <br />');
        }
    }
});

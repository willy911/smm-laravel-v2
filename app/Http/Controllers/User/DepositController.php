<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot | v1.0
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott  
| * Whatsapp : https://wa.me/6285349680016  
| * Telegram : https://t.me/jhondelton   
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Enums\PaymentMethod\PaymentMethod as PaymentMethodEnum;
use App\Models\Deposit\Deposit;
use App\Models\PaymentMethod;
use App\Models\User\UserActivityLog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Http;
use App\Enums\Deposit\Deposit as DepositEnum;
use App\Models\Locale;
use App\Services\User\DepositService;
use Exception;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DepositController extends Controller
{
    public function index(Request $request)
    {
        if ($request->has('page')) {
            $depositService = new DepositService($request);
            $tableItems = $depositService->getTableItems();
            $summary = $depositService->getSummary();
            return response()->json([
                'status' => true,
                'data' => $tableItems,
                'summary' => $summary,
            ]);
        }
        return inertia('user/deposit/index', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'paymentMethods' => PaymentMethod::whereHas('deposits', function ($query) {
                        $query->where('user_id', auth()->id());
                    })->withCount([
                        'deposits' => function ($query) {
                            $query->where('user_id', auth()->id());
                        }
                    ])->latest('id')->get()->map(function ($row) {
                        return [
                            'value'   => $row->id,
                            'label'   => $row->name,
                            'count'   => $row->deposits_count,
                        ];
                    }),
                ],
            )
        ]);
    }

    public function create()
    {
        return inertia('user/deposit/create', [
            'pageProps' => Inertia::defer(
                function () {
                    $pageProps['paymentMethods'] = PaymentMethod::where('status', '1')
                        // ->where('minimum', '<=', auth()->user()->userGroup->minimum_deposit)
                        ->distinct()
                        ->oldest('type')
                        ->get(['type'])
                        ->map(function ($row) {
                            return [
                                'value'   => $row->type,
                                'label'   => PaymentMethodEnum::getValue('ARRAY_TYPE_LABELS')[$row->type],
                                'options' => PaymentMethod::where('type', $row->type)
                                    ->where('status', '1')
                                    // ->where('minimum', '<=', auth()->user()->userGroup->minimum_deposit)
                                    ->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')
                                    ->get()
                                    ->makeVisible('id')->map(function ($item) {
                                        return $item;
                                    })
                            ];
                        })->toArray();

                    $order = [
                        'qris',
                        'transfer_bank',
                        'e_wallet',
                        'virtual_account',
                        'convenience_store'
                    ];

                    usort($pageProps['paymentMethods'], function ($a, $b) use ($order) {
                        $aIndex = array_search($a['value'], $order);
                        $bIndex = array_search($b['value'], $order);
                        return $aIndex - $bIndex;
                    });
                    return [
                        'paymentMethods' => $pageProps['paymentMethods'],
                        'lastDeposit'    => Deposit::where([
                            ['user_id', auth()->id()],
                            ['status', 'pending'],
                        ])->first()
                    ];
                },
            )
        ]);
    }

    public function store(DepositRequest $request)
    {
        $checkDepositLimit = Deposit::where('status', 'pending')
            ->where('user_id', auth()->id())
            ->count();
        if ($checkDepositLimit >= 1) {
            return redirect()->back()->with('responseError', __('deposits.toast.unpaid_payment'));
        }
        $localeId = Locale::find(1);
        $credentials = [
            'user_id'           => auth()->id(),
            'payment_method_id' => $request->input('payment_method.id'),
            'amount'            => $request->input('deposit.amount'),
            'bonus'             => 0,
            'unique_code'       => 0,
            'ip_address'        => $request->ip(),
            'user_agent'        => $request->header('User-Agent'),
            'initial_balance'   => auth()->user()->balance,
            'final_balance'     => auth()->user()->balance,
        ];
        $paymentMethod = PaymentMethod::find($credentials['payment_method_id']);
        $credentials['payment_method_name'] = $paymentMethod->name;
        if ($paymentMethod->admin_fee_configs->type === 'fixed') {
            $credentials['admin_fee'] = $paymentMethod->admin_fee_configs->value;
        } else {
            $credentials['admin_fee'] = ($paymentMethod->admin_fee_configs->value / 100) * $credentials['amount'];
            // if ($paymentMethod->payment_gateway === 'tripay' && in_array($paymentMethod->payment_gateway_payment_code, ['QRIS', 'QRISC', 'QRIS2'])) {
            //     $credentials['admin_fee'] = (($paymentMethod->admin_fee_amount / 100) * $credentials['amount']) + 750;
            // }
            // if ($paymentMethod->payment_gateway === 'tokopay' && in_array($paymentMethod->payment_gateway_payment_code, ['QRIS_CUSTOM'])) {
            //     $credentials['admin_fee'] = (($paymentMethod->admin_fee_amount / 100) * $credentials['amount']) + 250;
            // }
        }
        $bonusConfigs = $paymentMethod->bonus_configs ?? [];
        $amount = (float) $credentials['amount'];
        $bonusPercent = 0;
        if (!empty($bonusConfigs)) {
            $matchedBonus = null;
            $highestBonus = 0;
            foreach ($bonusConfigs as $config) {
                $min = (float) $config->min;
                $max = (float) $config->max;
                $bonus = (float) $config->bonus;
                if ($bonus > $highestBonus) {
                    $highestBonus = $bonus;
                }
                if ($amount >= $min && $amount <= $max) {
                    $matchedBonus = $bonus;
                    break;
                }
            }
            $maxValueInConfigs = max(array_column($bonusConfigs, 'max'));
            if ($amount > (float) $maxValueInConfigs && !$matchedBonus) {
                $matchedBonus = $highestBonus;
            }
            $bonusPercent = $matchedBonus ?? 0;
        }
        $credentials['bonus'] = ($bonusPercent / 100) * $amount;
        if (!$paymentMethod->payment_gateway) {
            $credentials['is_manual'] = '1';
            $credentials['unique_code'] = generate_unique_code();
            $credentials['payment_information'] = $paymentMethod->payment_target;
            $credentials['sender'] = $request->input('deposit.phone_number');
            $credentials['total_payment'] = $amount + $credentials['admin_fee'] + $credentials['unique_code'];
            $credentials['total_balance'] = $amount + $credentials['bonus'] + $credentials['unique_code'];
        } else {
            $credentials['payment_gateway_payment_id'] = generate_deposit_payment_gateway_payment_id();
            $credentials['total_payment'] = $amount + $credentials['admin_fee'] + $credentials['unique_code'];
            $credentials['total_balance'] = $amount + $credentials['bonus'] + $credentials['unique_code'];
        }
        if ($paymentMethod->payment_gateway === 'paydisini') {
            $paymentGatewayCredentials = [
                'key'           => website_config('payment_gateway')->paydisini->api_key,
                'request'       => 'new',
                'unique_code'   => $credentials['payment_gateway_payment_id'],
                'service'       => $paymentMethod->payment_gateway_payment_code,
                'amount'        => intval($credentials['total_payment'] * $localeId->usd_rate),
                'note'          => $paymentMethod->name,
                'valid_time'    => '10800',
                'type_fee'      => '1',
                'payment_guide' => true,
                'signature'     => md5(website_config('payment_gateway')->paydisini->api_key . $credentials['payment_gateway_payment_id'] . $paymentMethod->payment_gateway_payment_code . intval($credentials['total_payment'] * $localeId->usd_rate) . '10800' . 'NewTransaction'),
                // 'return_url'    => route('user.deposits.show', ['target' => $credentials['id']]),
                'return_url'    => route('user.deposits.index'),
            ];
            if ($paymentMethod->type === 'e_wallet') {
                $paymentGatewayCredentials['ewallet_phone'] = $request->input('deposit.phone_number');
            }
            $curl = Http::asForm()->post('https://api.paydisini.co.id/v1/', $paymentGatewayCredentials);
            if (!$curl->json()['success']) {
                return redirect()->back()->with('responseError', __('deposits.toast.payment_not_available'));
            }
            $credentials['payment_gateway_payment_token'] = $curl->json()['data']['pay_id'];
            $credentials['payment_gateway_checkout_url'] = $curl->json()['data']['checkout_url'];
            $credentials['payment_gateway_api_log'] = $curl->json();
        }
        if ($paymentMethod->payment_gateway === 'tripay') {
            if (in_array($paymentMethod->payment_gateway_payment_code, ['QRIS', 'QRISC', 'QRIS2'])) {
                $credentials['admin_fee'] = (($paymentMethod->admin_fee_configs->value / 100) * $credentials['amount']) + (750 / $localeId->usd_rate);
                $credentials['total_payment'] = $amount + $credentials['admin_fee'] + $credentials['unique_code'];
            }
            $paymentGatewayCredentials = [
                'method'        => $paymentMethod->payment_gateway_payment_code,
                'merchant_ref'  => $credentials['payment_gateway_payment_id'],
                'amount'        => intval($credentials['total_payment'] * $localeId->usd_rate),
                'customer_name' => auth()->user()->full_name,
                'customer_email' => auth()->user()->email,
                'customer_phone' => $paymentMethod->type === 'e_wallet' ? $request->input('deposit.phone_number') : auth()->user()->whatsapp,
                // 'return_url'    => route('user.deposits.show', ['target' => $credentials['id']]),
                'return_url'    => route('user.deposits.index'),
                'order_items'   => [[
                    'sku'      => 'Deposit',
                    'name'     => $paymentMethod->name,
                    'price'    => intval($credentials['total_payment'] * $localeId->usd_rate),
                    'quantity' => 1,
                ]],
                'expired_time'  => (time() + (3 * 60 * 60)),
                'signature'     => hash_hmac('sha256', website_config('payment_gateway')->tripay->merchant_id . $credentials['payment_gateway_payment_id'] . intval($credentials['total_payment'] * $localeId->usd_rate), website_config('payment_gateway')->tripay->private_key),
            ];
            $curl = Http::asForm()->withHeaders([
                'Authorization' => 'Bearer ' . website_config('payment_gateway')->tripay->api_key,
            ])->post('https://tripay.co.id/api/transaction/create', $paymentGatewayCredentials);
            if (!$curl->json()['success']) {
                return redirect()->back()->with('responseError', __('deposits.toast.payment_not_available'));
            }
            // $credentials['payment_information'] = json_encode($curl->json()['data']['instructions'], true);
            $credentials['payment_gateway_payment_token'] = $curl->json()['data']['reference'];
            $credentials['payment_gateway_checkout_url'] = $curl->json()['data']['checkout_url'];
            $credentials['payment_gateway_api_log'] = $curl->json();
        }
        if ($paymentMethod->payment_gateway === 'tokopay') {
            if (in_array($paymentMethod->payment_gateway_payment_code, ['QRIS_CUSTOM'])) {
                $credentials['admin_fee'] = (($paymentMethod->admin_fee_configs->value / 100) * $credentials['amount']) + (250 / $localeId->usd_rate);
                $credentials['total_payment'] = $amount + $credentials['admin_fee'] + $credentials['unique_code'];
            }
            $paymentGatewayCredentials = [
                'kode_channel'   => $paymentMethod->payment_gateway_payment_code,
                'reff_id'        => $credentials['payment_gateway_payment_id'],
                'amount'         => intval($credentials['total_payment'] * $localeId->usd_rate),
                'merchant_id'    => website_config('payment_gateway')->tokopay->merchant_id,
                'customer_name'  => auth()->check() ? auth()->user()->full_name : website_config()->name,
                'customer_email' => auth()->user()->email,
                'customer_phone' => $paymentMethod->type === 'e_wallet' ? $request->input('deposit.phone_number') : auth()->user()->whatsapp,
                'expired_ts'     => (time() + (3 * 60 * 60)),
                'signature'      => md5(website_config('payment_gateway')->tokopay->merchant_id . ':' . website_config('payment_gateway')->tokopay->secret_key . ':' . $credentials['payment_gateway_payment_id']),
            ];
            // $curl = Http::post('https://api.tokopay.id/v1/order', $paymentGatewayCredentials);
            $curl = Http::get('https://api.tokopay.id/v1/order?merchant=' . website_config('payment_gateway')->tokopay->merchant_id . '&secret=' . website_config('payment_gateway')->tokopay->secret_key . '&ref_id=' . $credentials['payment_gateway_payment_id'] . '&nominal=' . intval($credentials['total_payment'] * $localeId->usd_rate) . '&metode=' . $paymentMethod->payment_gateway_payment_code . '');
            if (!$curl->json()['status']) {
                return redirect()->back()->with('responseError', __('deposits.toast.payment_not_available'));
            }
            $credentials['payment_gateway_payment_token'] = $curl->json()['data']['trx_id'];
            $credentials['payment_gateway_checkout_url'] = $curl->json()['data']['pay_url'];
            $credentials['payment_gateway_api_log'] = $curl->json();
        }
        if ($paymentMethod->payment_gateway === 'duitku') {
            // $duitkuConfig = new \Duitku\Config(website_config('duitku')->api_key, website_config('duitku')->merchant_id);
            $duitkuConfig = new \Duitku\Config('5d549a542d2b6dcc05a65e62664c5dcb', 'DS26240');
            $duitkuConfig->setSandboxMode(true);
            $duitkuConfig->setSanitizedMode(false);
            $duitkuConfig->setDuitkuLogs(false);
            $paymentAmount      = $credentials['amount'] * Locale::find(1)->usd_rate;
            $paymentMethod      = $paymentMethod->payment_gateway_payment_code;
            $email              = auth()->user()->email;
            $phoneNumber        = auth()->user()->whatsapp;
            $productDetails     = $credentials['payment_gateway_payment_id'];
            $merchantOrderId    = time();
            $additionalParam    = '';
            $merchantUserInfo   = '';
            $customerVaName     = auth()->user()->full_name;
            $callbackUrl        = url('/callback/duitku');
            $returnUrl          = route('guest.dashboard');
            $expiryPeriod       = 60;

            $params = array(
                'paymentAmount'     => $paymentAmount,
                'paymentMethod'     => $paymentMethod,
                'merchantOrderId'   => $merchantOrderId,
                'productDetails'    => $productDetails,
                'additionalParam'   => $additionalParam,
                'merchantUserInfo'  => $merchantUserInfo,
                'customerVaName'    => $customerVaName,
                'email'             => $email,
                'phoneNumber'       => $phoneNumber,
                'callbackUrl'       => $callbackUrl,
                'returnUrl'         => $returnUrl,
                'expiryPeriod'      => $expiryPeriod
            );

            try {
                $responseDuitkuApi = \Duitku\Api::createInvoice($params, $duitkuConfig);
                $json = json_decode($responseDuitkuApi);
                $credentials['payment_gateway_payment_token'] = $json->reference;
                $credentials['payment_gateway_checkout_url'] = $json->paymentUrl;
                $credentials['payment_gateway_api_log'] = $json;
            } catch (Exception $e) {
                info($e->getMessage());
                return redirect()->back()->with('responseError', 'Metode Pembayaran sedang tidak dapat digunakan, Silahkan menggunakan metode lainnya.');
            }
        }
        if ($paymentMethod->payment_gateway === 'midtrans') {
            \Midtrans\Config::$serverKey = website_config('payment_gateway')->midtrans->server_key;
            \Midtrans\Config::$isProduction = true;
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;
            \Midtrans\Config::$overrideNotifUrl = url('callback/midtrans');
            $paymentGatewayCredentials = array(
                'transaction_details' => array(
                    'order_id'     =>  $credentials['payment_gateway_payment_id'],
                    'gross_amount' => intval($credentials['total_payment'] * $localeId->usd_rate),
                ),
                'customer_details'    => array(
                    'first_name'       => auth()->user()->full_name,
                    'last_name'        => null,
                    'email'            => auth()->user()->email,
                    'phone'            => auth()->user()->whatsapp,
                )
            );
            try {
                $curl = \Midtrans\Snap::createTransaction($paymentGatewayCredentials);
                $credentials['payment_gateway_payment_token'] = $curl->token;
                $credentials['payment_gateway_checkout_url'] = $curl->redirect_url;
                $credentials['payment_gateway_api_log'] = $curl;
            } catch (Exception $e) {
                info($e->getMessage());
                return redirect()->back()->with('responseError', __('deposits.toast.payment_not_available'));
            }
        }
        if ($paymentMethod->payment_gateway === 'cryptomus') {
            $paymentKey = website_config('payment_gateway')->cryptomus->payment_key;
            $merchantUuid = website_config('payment_gateway')->cryptomus->merchant_uuid;
            $payment = \Cryptomus\Api\Client::payment($paymentKey, $merchantUuid);
            $data = [
                'amount' => (string) $credentials['total_payment'],
                'currency' => 'USD',
                'order_id' => $credentials['payment_gateway_payment_id'],
                'url_return' => route('user.deposits.index'),
                'url_callback' => url('/callback/cryptomus'),
                'is_payment_multiple' => false,
                'lifetime' => '7200',
            ];
            try {
                $curl = $payment->create($data);
                $credentials['payment_gateway_payment_token'] = $curl['uuid'];
                $credentials['payment_gateway_checkout_url'] = $curl['url'];
                $credentials['payment_gateway_api_log'] = $curl;
            } catch (Exception $e) {
                info($credentials);
                info($e->getMessage());
                return redirect()->back()->with('responseError', __('deposits.toast.payment_not_available'));
            }
        }
        if ($paymentMethod->payment_gateway === 'flazpay') {
            $flazpayCredentials = website_config('payment_gateway')->flazpay ?? null;
            if (!$flazpayCredentials || $flazpayCredentials->merchant_id == '' || $flazpayCredentials->client_id == '' || $flazpayCredentials->client_secret == '') {
                return redirect()->back()->with('responseError', __('deposits.toast.payment_not_available'));
            }
            // Flazpay menerima nominal dalam Rupiah (min. 100) — konsisten dengan
            // gateway lain yang mengirim `total_payment * usd_rate`. Nilai dasar
            // USD tetap yang disimpan ke DB.
            $flazpayAmount = intval(round($credentials['total_payment'] * $localeId->usd_rate));
            $paymentGatewayCredentials = [
                'mid'           => $flazpayCredentials->merchant_id,
                'client_id'     => $flazpayCredentials->client_id,
                'client_secret' => $flazpayCredentials->client_secret,
                'action'        => 'new',
                'unique_code'   => $credentials['payment_gateway_payment_id'],
                'service'       => $paymentMethod->payment_gateway_payment_code,
                'amount'        => $flazpayAmount,
                'note'          => $paymentMethod->name,
                'type_fee'      => 1,
                'phone_number'  => $paymentMethod->type === 'e_wallet' ? $request->input('deposit.phone_number') : auth()->user()->whatsapp,
                // 'return_url'    => route('user.deposits.show', ['target' => $credentials['payment_gateway_payment_id']]),
                'return_url'    => route('user.deposits.index'),
                // Signature wajib memakai `amount` yang sama dengan yang dikirim.
                'signature'     => md5($flazpayCredentials->client_id . $flazpayCredentials->client_secret . $flazpayCredentials->merchant_id . $credentials['payment_gateway_payment_id'] . $paymentMethod->payment_gateway_payment_code . $flazpayAmount . 'new')
            ];
            $curl = Http::asForm()->post('https://flazpay.id/snap/v1/request/create', $paymentGatewayCredentials);
            $response = $curl->json();
            if (!is_array($response) || !isset($response['status']) || !$response['status']) {
                info($response);
                return redirect()->back()->with('responseError', __('deposits.toast.payment_not_available'));
            }
            $credentials['payment_gateway_payment_token'] = $response['data']['unique_code'];
            $credentials['payment_gateway_checkout_url'] = $response['data']['redirect_url'];
            $credentials['payment_gateway_api_log'] = $response;
        }
        $insertDeposit = Deposit::create($credentials);
        (new DepositService($request))->invalidateUserDepositsCache(auth('web')->id());
        UserActivityLog::create([
            'user_id'        => auth()->id(),
            'ip_address'     => request()->ip(),
            'user_agent'     => request()->header('User-Agent'),
            'content_key'    => 'deposits:log.create-successful',
            'content_params' => (object) ['deposit_id' => $insertDeposit->id],
        ]);
        return redirect()->back()->with('responseSuccess', __('deposits.toast.create_successful', ['deposit_id' => $insertDeposit->id]));
    }


    public function show(Deposit $target)
    {
        abort_if($target->user_id <> auth()->id(), 404);
        $pageProps['target'] = $target;
        if ($target->is_manual === '0') {
            if ($target->paymentMethod->payment_gateway === 'paydisini') {
                $pageProps['paymentGateway'] = '1';
                $pageProps['paymentGuides'] = $target->payment_gateway_api_log->payment_guide ?? [];
                if ($target->paymentMethod->payment_gateway_payment_code <= 10 || in_array($target->paymentMethod->payment_gateway_payment_code, ['21', '22'])) {
                    $pageProps['paymentTarget'] = [
                        'service_name'   => $target->payment_gateway_api_log->data->service_name ?? '-',
                        'virtual_account' => $target->payment_gateway_api_log->data->virtual_account ?? '-',
                    ];
                }
                if (in_array($target->paymentMethod->payment_gateway_payment_code, ['11', '17', '20', '23'])) {
                    $pageProps['paymentTarget'] = [
                        'service_name' => 'QRIS',
                        'qr_content'   => $target->payment_gateway_api_log->data->qr_content ?? '-',
                        'qrcode_url'   => $target->payment_gateway_api_log->data->qrcode_url ?? '-',
                    ];
                }
                if (in_array($target->paymentMethod->payment_gateway_payment_code, ['12', '13', '14', '23'])) {
                    $pageProps['paymentTarget'] = [
                        'service_name'          => $target->payment_gateway_api_log->data->service_name ?? '-',
                        'e_wallet_checkout_url' => $target->payment_gateway_api_log->data->checkout_url_beta ?? '-',
                    ];
                }
                if (in_array($target->paymentMethod->payment_gateway_payment_code, ['18', '19'])) {
                    $pageProps['paymentTarget'] = [
                        'service_name' => $target->payment_gateway_api_log->data->service_name ?? '-',
                        'payment_code' => $target->payment_gateway_api_log->data->payment_code ?? '-',
                    ];
                }
            } elseif ($target->paymentMethod->payment_gateway === 'tripay') {
                $pageProps['paymentGateway'] = '2';
                $pageProps['paymentGuides'] = $target->payment_gateway_api_log->data->instructions ?? [];
                if (in_array($target->paymentMethod->payment_gateway_payment_code, [
                    'PERMATAVA',
                    'BNIVA',
                    'BRIVA',
                    'MANDIRIVA',
                    'MUAMALATVA',
                    'CIMBVA',
                    'BSIVA',
                    'OCBCVA',
                    'DANAMONVA',
                    'OTHERBANKVA',
                    'ALFAMART',
                    'INDOMARET',
                    'ALFAMIDI',
                ])) {
                    $pageProps['paymentTarget'] = [
                        'service_name'   => $target->payment_gateway_api_log->data->service_name ?? '-',
                        'virtual_account' => $target->payment_gateway_api_log->data->pay_code ?? '-',
                    ];
                }
                if (in_array($target->paymentMethod->payment_gateway_payment_code, ['QRIS', 'QRISC', 'QRIS2', 'QRIS_SHOPEEPAY'])) {
                    $pageProps['paymentTarget'] = [
                        'service_name' => 'QRIS',
                        'qr_content'   => $target->payment_gateway_api_log->data->qr_string ?? '-',
                        'qrcode_url'   => $target->payment_gateway_api_log->data->qr_url ?? '-',
                    ];
                }
                if (in_array($target->paymentMethod->payment_gateway_payment_code, ['OVO', 'DANA', 'SHOPEEPAY'])) {
                    $pageProps['paymentTarget'] = [
                        'service_name'          => $target->payment_gateway_api_log->data->service_name ?? '-',
                        'e_wallet_checkout_url' => $target->payment_gateway_api_log->data->pay_url ?? '-',
                    ];
                }
                // if (in_array($target->paymentMethod->payment_gateway_payment_code, ['18', '19'])) {
                //     $pageProps['paymentTarget'] = [
                //         'service_name' => $target->payment_gateway_api_log->data->service_name ?? '-',
                //         'payment_code' => $target->payment_gateway_api_log->data->payment_code ?? '-',
                //     ];
                // }
            } elseif ($target->paymentMethod->payment_gateway === 'duiktu' || $target->paymentMethod->payment_gateway === 'flazpay') {
                $pageProps['paymentTarget'] = [
                    'e_wallet_checkout_url' => $target->payment_gateway_checkout_url ?? null,
                ];
            }
        }
        if ($target->is_manual === 1) {
            $pageProps['paymentTarget'] = $target->payment_information;
        }
        return inertia('User/Deposit/Detail', $pageProps);
    }

    public function report(Request $request)
    {
        if ($request->has('from')) {
            $tableItemsQuery = Deposit::query()->where('user_id', auth()->id());
            if ($request->filled(['from', 'to'])) {
                $tableItemsQuery->whereBetween(DB::raw('DATE(created_at)'), [
                    date('Y-m-d', strtotime($request->input('from'))),
                    date('Y-m-d', strtotime($request->input('to')))
                ]);
            } elseif ($request->filled('from')) {
                $tableItemsQuery->whereDate(
                    'created_at',
                    date('Y-m-d', strtotime($request->input('from')))
                );
            }

            $tableItems = $tableItemsQuery->orderBy('id', 'desc')->limit(500)->get([
                'id',
                'payment_method_name',
                'amount',
                'bonus',
                'admin_fee',
                'total_payment',
                'total_balance',
                'status',
                'created_at',
            ]);
            $summary = [
                'total' => [
                    'count' => $tableItems->count(),
                    'amount' => $tableItems->sum('amount'),
                ],
                'pending' => [
                    'count' => $tableItems->where('status', 'pending')->count(),
                    'amount' => $tableItems->where('status', 'pending')->sum('amount'),
                ],
                'success' => [
                    'count' => $tableItems->where('status', 'success')->count(),
                    'amount' => $tableItems->where('status', 'success')->sum('amount'),
                ],
                'failed' => [
                    'count' => $tableItems->whereIn('status', ['expired', 'canceled'])->count(),
                    'amount' => $tableItems->whereIn('status', ['expired', 'canceled'])->sum('amount'),
                ],
            ];

            return response()->json([
                'status' => true,
                'pageProps' => [
                    'summary' => $summary,
                    'rows' => $tableItems,
                ],
            ]);
        }

        return inertia('user/deposit/report', [
            'pageProps' => [
                'summary' => [
                    'total' => ['count' => 0, 'amount' => 0],
                    'pending' => ['count' => 0, 'amount' => 0],
                    'success' => ['count' => 0, 'amount' => 0],
                    'failed' => ['count' => 0, 'amount' => 0],
                ],
                'rows' => [],
            ],
        ]);
    }

    public function switch(Deposit $target, $columnName, $columnValue)
    {
        if ($columnName == 'status') {
            $columnNameLabel = 'Status';
            $from = DepositEnum::getValue('ARRAY_STATUS_LABELS')[$target->status];
            $to   = DepositEnum::getValue('ARRAY_STATUS_LABELS')[$columnValue];
        }
        if ($target->update([$columnName => $columnValue])) {
            $insertActivityLog = UserActivityLog::create([
                'user_id'    => auth()->id(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content_key'  => 'deposits:log.cancel-successful',
                'content_params'  => (object) ['deposit_id' => $target->id],
            ]);
            $depositService = new DepositService(request());
            $depositService->invalidateUserDepositsCache(auth('web')->id());
            return response()->json([
                'status'  => true,
                'message' => __('deposits.toast.cancel_successful', ['deposit_id' => $target->id]),
            ]);
        }
        return response()->json([
            'status'  => false,
            'message' => __('common.toast.exception')
        ], 500);
    }
}

class DepositRequest extends FormRequest
{
    public function rules(Request $request)
    {
        $paymentMethod = PaymentMethod::find($request->input('payment_method.id'));

        // Batas minimum/maximum tersimpan dalam nilai dasar USD, sedangkan UI
        // menampilkan jumlah memakai kurs locale aktif. Frontend menghitung
        // `amount` = `display_amount` / kurs, jadi kurs display bisa diturunkan
        // dari payload itu sendiri: satuan validasi selalu sama dengan yang
        // dilihat user, tanpa bergantung pada sinkronisasi cookie locale.
        $minimum = (float) ($paymentMethod?->minimum ?? 1);
        $maximum = (float) ($paymentMethod?->maximum ?? 1);
        $amount = (float) $request->input('deposit.amount');
        $display = (float) $request->input('deposit.display_amount');
        $rate = ($amount > 0 && $display > 0)
            ? $display / $amount
            : (float) (Locale::find(1)?->usd_rate ?? 1);

        return [
            'payment_method.id' => ['required', 'exists:payment_methods,id'],
            // Otoritatif: nilai yang benar-benar disimpan ke database (USD).
            'deposit.amount' => [
                'required',
                'numeric',
                $paymentMethod ? 'min:' . round($minimum, 6) : 'min:1',
                $paymentMethod ? 'max:' . round($maximum, 6) : 'max:1',
            ],
            // Konsistensi tampilan: pesan validasi live memakai satuan yang sama
            // dengan angka pada form.
            'deposit.display_amount' => [
                'required',
                'numeric',
                'min:' . round($minimum * $rate, 4),
                'max:' . round($maximum * $rate, 4),
            ],
            'deposit.phone_number'    => $paymentMethod && $paymentMethod->type == 'e_wallet' ? [
                'numeric',
                'phone:ID,mobile',
                'required'
            ] : [],
        ];
    }

    public function attributes()
    {
        return [
            'payment_method.id'      => __('common.labels.payment_method'),
            'deposit.display_amount' => __('deposits.labels.deposit_amount'),
            'deposit.phone_number'   => __('deposits.labels.e_wallet_number'),
        ];
    }
}

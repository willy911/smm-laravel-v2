<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott
| * Whatsapp : https://wa.me/6285349680016
| * Telegram : https://t.me/jhonroott
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

namespace App\Http\Controllers\Cronjob;

use App\Http\Controllers\Controller;
use App\Models\Deposit\Deposit;
use App\Models\MobileNotification;
use App\Models\User\User;
use App\Models\User\UserBalanceLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class BCAMutationController extends Controller
{
    public function __invoke()
    {
        $config = config('services.bca_mutation', []);
        $config = is_array($config) ? $config : [];

        // Stub aman: tanpa kredensial -> jangan sentuh API eksternal sama sekali.
        if (
            empty($config['enabled'])
            || empty($config['api_key'])
            || empty($config['endpoint'])
        ) {
            return response('BCA mutation dinonaktifkan (config stub belum diisi).', 200)
                ->header('Content-Type', 'text/plain');
        }

        $curl = Http::asForm()->post($config['endpoint'], [
            'api_key'   => $config['api_key'],
            'startDate' => now()->format('Y-m-d'),
            'endDate'   => now()->format('Y-m-d'),
        ]);
        if (!$curl->successful()) return response($curl->body(), 200)->header('Content-Type', 'text/plain');
        if (!isset($curl->object()->response_server->mutasi)) return response($curl->body(), 200)->header('Content-Type', 'text/plain');

        $results = [];
        foreach ($curl->object()->response_server->mutasi as $item) {
            if ($item->mutasi == 'CR') {
                $item->nominal = (int) str_replace([',', '.00'], '', $item->nominal);
                $checkMutation = MobileNotification::where([
                    ['payment', 'BCA'],
                    ['amount', $item->nominal],
                    ['content', $item->keterangan],
                ])->whereDate('created_at', date('Y-m-d'))->count();
                if ($checkMutation < 1) {
                    $deposit = Deposit::where([
                        ['status', 'pending'],
                        ['is_manual', '1'],
                        ['total_payment', $item->nominal],
                    ])->whereDate('created_at', date('Y-m-d'))->first();
                    if ($deposit) {
                        MobileNotification::create([
                            'is_used' => '1',
                            'payment' => 'BCA',
                            'amount'  => $item->nominal,
                            'content' => $item->keterangan,
                        ]);
                        DB::transaction(function () use ($deposit, &$results) {
                            $fresh = Deposit::whereKey($deposit->id)->lockForUpdate()->first();
                            if (!$fresh || $fresh->status !== 'pending') {
                                $results[] = 'Deposit #' . $deposit->id . ' sudah diproses run lain.';
                                return; // sudah diproses run lain; jangan kredit & jangan update deposit
                            }
                            $lockedUser = User::whereKey($fresh->user_id)->lockForUpdate()->first();
                            if (!$lockedUser) {
                                $results[] = 'User untuk Deposit #' . $fresh->id . ' tidak ditemukan.';
                                return;
                            }
                            $initialBalance = (float) $lockedUser->balance;
                            $finalBalance = $initialBalance + (float) $fresh->total_balance;
                            $fresh->update([
                                'status'        => 'success',
                                'final_balance' => $finalBalance,
                            ]);
                            $lockedUser->update([
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
                        });
                        $results[] = 'Berhasil! Mutasi ditambahkan kedalam database. <br />';
                    } else {
                        MobileNotification::create([
                            'payment' => 'BCA',
                            'amount'  => $item->nominal,
                            'content' => $item->keterangan,
                        ]);
                        $results[] = 'Berhasil! Mutasi ditambahkan kedalam database. <br />';
                    }
                } else {
                    $results[] = 'Gagal! Mutasi sudah ada didalam database. <br />';
                }
            }
        }

        return response(implode('', $results), 200)->header('Content-Type', 'text/html');
    }
}

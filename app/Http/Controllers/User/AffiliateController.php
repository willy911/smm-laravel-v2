<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott  
| * Whatsapp : https://wa.me/6285349680016  
| * Telegram : https://t.me/jhondelton   
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Website\WebsiteBlog;
use App\Enums\Service\Service as ServiceEnum;
use App\Models\Deposit\Deposit;
use App\Models\Leaderboard;
use App\Models\Order\Order;
use App\Models\Service\Service;
use App\Models\User\User;
use App\Models\User\UserBalanceLog;
use App\Models\User\UserCommissionWithdrawal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class AffiliateController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['withdraw']),
        ];
    }

    public function index(Request $request)
    {
        if ($request->has('page')) {
            $tableItems = UserCommissionWithdrawal::where([
                ['user_id', auth()->id()],
            ])->when($request->input(), function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length') ?: 30)->onEachSide(1);
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('user/affiliate', [
            'pageProps' => Inertia::defer(
                // fn() => Cache::tags('user_leaderboard')->remember('user_leaderboard', now()->addHours(6), function () {
                fn() => [
                    'totalReferrals' => auth()->user()->referrals()->count(),
                    'totalEarnings' => UserBalanceLog::where([
                        ['user_id', auth()->id()],
                        ['type', 'credit'],
                        ['category', 'commission']
                    ])->sum('amount')
                ],
            )
        ]);
    }

    public function withdraw(Request $request)
    {
        $amount = (float) $request->input('commission_withdrawal.amount');
        $type = $request->input('commission_withdrawal.type');

        if ($amount < website_config('affiliate')->min_withdrawal) {
            return to_route('user.affiliate.index')->with(
                'responseError',
                __('affiliate.toast.min_withdrawal', [
                    'amount' => format_currency(website_config('affiliate')->min_withdrawal)
                ])
            );
        }

        if ($amount > auth()->user()->commission) {
            return to_route('user.affiliate.index')->with(
                'responseError',
                __('affiliate.toast.max_withdrawal', [
                    'amount' => format_currency(auth()->user()->commission)
                ])
            );
        }

        DB::transaction(function () use ($amount, $type, $request) {

            $user = auth()->user();

            $initialCommission = $user->commission;
            $finalCommission = $initialCommission - $amount;

            $user->update([
                'commission' => $finalCommission,
            ]);

            UserBalanceLog::create([
                'user_id' => $user->id,
                'type' => 'debit',
                'category' => 'commission',
                'amount' => $amount,
                'initial_balance' => $initialCommission,
                'final_balance' => $finalCommission,
                'content_key' => 'affiliate:log.requested-commission-withdrawal',
                'content_params' => (object) [
                    'amount' => $amount
                ],
            ]);

            if ($type === 'balance') {

                $initialBalance = $user->balance;
                $finalBalance = $initialBalance + $amount;

                $user->update([
                    'balance' => $finalBalance,
                ]);

                UserBalanceLog::create([
                    'user_id' => $user->id,
                    'type' => 'credit',
                    'category' => 'other',
                    'amount' => $amount,
                    'initial_balance' => $initialBalance,
                    'final_balance' => $finalBalance,
                    'content_key' => 'affiliate:log.commission-withdrawal-to-balance-successful',
                    'content_params' => (object) [
                        'amount' => $amount
                    ],
                ]);
                UserCommissionWithdrawal::create([
                    'user_id' => $user->id,
                    'type' => 'balance',
                    'amount' => $amount,
                    'status' => 'approved',
                ]);
            }

            if ($type === 'bank') {

                UserCommissionWithdrawal::create([
                    'user_id' => $user->id,
                    'type' => 'bank',
                    'amount' => $amount,
                    'bank_name' => $request->input('commission_withdrawal.bank_name'),
                    'bank_account_name' => $request->input('commission_withdrawal.bank_account_name'),
                    'bank_account_number' => $request->input('commission_withdrawal.bank_account_number'),
                    'status' => 'waiting',
                ]);
            }
        });

        return to_route('user.affiliate.index')->with(
            'responseSuccess',
            __('affiliate.toast.commission_withdrawal_successful')
        );
    }
}

class AffiliateWithdrawRequest extends FormRequest
{
    public function rules(Request $request)
    {
        return [
            'commission_withdrawal.display_amount' => [
                'required',
                'numeric',
                'min:' . format_currency(website_config('affiliate')->min_withdrawal, true),
                'max:' . format_currency(auth()->user()->commission, true),
            ],
        ];
    }

    public function attributes()
    {
        return [
            'commission_withdrawal.display_amount' => __('common.labels.amount'),
        ];
    }
}

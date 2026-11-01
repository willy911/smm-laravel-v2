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

namespace App\Http\Controllers\Admin;

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
        abort_unless(auth('admin')->user()->group->is_primary, 403);
        if ($request->has('page')) {
            $tableItems = UserCommissionWithdrawal::with('user')->when($request->input(), function ($query) use ($request) {
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
        return inertia('admin/affiliate', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'users' => User::whereHas('userCommissionWithdrawals')->withCount(['userCommissionWithdrawals'])->latest('id')->limit(100)->get()->map(function ($row) {
                        return [
                            'value'   => $row->id,
                            'label'   => $row->username,
                            'count'   => $row->user_commission_withdrawals_count,
                        ];
                    }),
                ],
            )
        ]);
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.invalid_id'),
            ], 400);
        }
        $targets = UserCommissionWithdrawal::whereIn('id', $ids)->get();
        if ($targets->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => __('common.empty.no_data_found'),
            ], 404);
        }
        foreach ($targets as $target) {
            if ($columnName == 'status') {
                $columnNameLabel = 'status';
                $from = $target->status;
                // Idempoten: approve/reject hanya boleh dari 'waiting'.
                // Tanpa ini, reject atas data yang sudah 'approved' mengembalikan
                // komisi dua kali (uang ganda).
                if (!in_array($from, ['waiting'])) {
                    continue;
                }
            }
            if ($from != $columnValue) {
                if ($columnValue === 'approved') {
                    // $initialBalance = $target->user->balance;
                    // $finalBalance = $initialBalance + $target->amount;

                    // $target->user->update([
                    //     'balance' => $finalBalance,
                    // ]);
                    UserBalanceLog::create([
                        'user_id' => $target->user->id,
                        'type' => 'credit',
                        'category' => 'other',
                        'amount' => $target->amount,
                        'initial_balance' => 0,
                        'final_balance' => 0,
                        'content_key' => 'affiliate:log.commission-withdrawal-to-bank-successful',
                        'content_params' => (object) [
                            'amount' => $target->amount
                        ],
                    ]);
                }
                if ($columnValue === 'rejected') {
                    $initialCommission = $target->user->commission;
                    $finalCommission = $initialCommission + $target->amount;

                    $target->user->update([
                        'commission' => $finalCommission,
                    ]);
                }
                $target->update([$columnName => $columnValue]);
            }
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.switch_successful', [
                'item' => __('common.labels.ticket'),
                'id' => implode(', ', $ids),
                'column' => __('common.labels.' . $columnNameLabel . ''),
            ]),
        ]);
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

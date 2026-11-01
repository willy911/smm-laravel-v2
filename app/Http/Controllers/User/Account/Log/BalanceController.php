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

namespace App\Http\Controllers\User\Account\Log;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User\UserBalanceLog;
use App\Tables\User\Account\Log\Balance as BalanceTable;
use Illuminate\Support\Facades\Auth;
use App\Enums\Account\Log\Balance as BalanceEnum;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BalanceController extends Controller
{
    public function __invoke(Request $request)
    {
        if ($request->has('page')) {
            $applyFilters = function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.type')) {
                    $query->whereIn('type', explode(',', $request->input('filter.type')));
                }
                if ($request->filled('filter.category')) {
                    $query->whereIn('category', explode(',', $request->input('filter.category')));
                }
                if ($request->filled('filter.search')) {
                    $query->where(function ($query) use ($request) {
                        $query->whereAny([
                            'type',
                            'category',
                        ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                    });
                }
            };
            $tableItems = UserBalanceLog::where('user_id', auth()->id())->when($request->input(), $applyFilters)->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $summary = UserBalanceLog::where('user_id', auth()->id())->select(
                DB::raw("
                        CASE 
                            WHEN type IN ('debit') THEN 'debit' 
                            ELSE type 
                        END as custom_type
                    "),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(amount) as amount')
            )
                ->when($request->input(), $applyFilters)
                ->groupBy('custom_type')
                ->get()
                ->mapWithKeys(function ($item) {
                    return [
                        $item->custom_type => [
                            'count' => $item->count,
                            'amount' => $item->amount,
                        ]
                    ];
                });

            $summary = [
                'total'     => ['count' => collect($summary)->sum('count'), 'amount' => collect($summary)->sum('amount')],
                'credit' => $summary['credit'] ?? ['count' => 0, 'amount' => 0],
                'debit' => $summary['debit'] ?? ['count' => 0, 'amount' => 0],
            ];
            return response()->json([
                'status' => true,
                'data' => $tableItems,
                'summary' => $summary,
            ]);
        }
        return inertia('user/account/log/balance', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'types' => UserBalanceLog::where('user_id', auth()->id())->distinct()->get(['type'])
                        ->map(function ($row) {
                            return [
                                'value' => $row->type,
                                'label'   => BalanceEnum::getValue('ARRAY_TYPE_LABELS')[$row->type],
                                'count' => UserBalanceLog::where('user_id', auth()->id())->where('type', $row->type)->count(),
                            ];
                        }),
                    'categories' => UserBalanceLog::where('user_id', auth()->id())->distinct()->get(['category'])
                        ->map(function ($row) {
                            return [
                                'value' => $row->category,
                                'label'   => BalanceEnum::getValue('ARRAY_CATEGORY_LABELS')[$row->category],
                                'count' => UserBalanceLog::where('user_id', auth()->id())->where('category', $row->category)->count(),
                            ];
                        }),
                ]
            )
        ]);
    }
}

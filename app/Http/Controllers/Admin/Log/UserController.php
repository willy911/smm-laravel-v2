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

namespace App\Http\Controllers\Admin\Log;

use Exception;
use Inertia\Inertia;
use App\Models\User\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use App\Models\User\UserActivityLog;
use App\Models\User\UserSigninLog;
use App\Models\PaymentMethod;
use App\Models\Product\ProductCategory;
use App\Models\User\UserBalanceLog;
use App\Models\User\UserSignupLog;
use App\Services\Admin\User\UserService;
use App\Services\User\PaymentMethodService;
use App\Services\User\Product\CategoryGroupService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Enums\Account\Log\Balance as BalanceEnum;

class UserController extends Controller
{
    public function signin(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('log.user.signin.access'), 403);
        if ($request->has('page')) {
            $tableItems = UserSigninLog::with('user')->when($request->input(), function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.user_id')) {
                    $query->whereIn('user_id', explode(',', $request->input('filter.user_id')));
                }
                if ($request->input('filter.search')) {
                    $query->whereAny([
                        'id',
                        'ip_address',
                        'user_agent',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                $item->makeVisible(['id']);
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('admin/log/user/signin', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'users' => [
                        'filters' => User::has('userSigninLogs')->withCount(['userSigninLogs'])->latest()->get()->map(function ($row) {
                            return [
                                'value' => $row->id,
                                'label' => $row->username,
                                'count' => $row->user_signin_logs_count,
                            ];
                        }),
                    ],
                ]
            )
        ]);
    }

    public function activity(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('log.user.activity.access'), 403);
        if ($request->has('page')) {
            $tableItems = UserActivityLog::with('user')->when($request->input(), function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.user_id')) {
                    $query->whereIn('user_id', explode(',', $request->input('filter.user_id')));
                }
                if ($request->input('filter.search')) {
                    $query->whereAny([
                        'id',
                        'content_key',
                        'content_params',
                        'ip_address',
                        'user_agent',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                $item->makeVisible(['id']);
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('admin/log/user/activity', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'users' => [
                        'filters' => User::has('userActivityLogs')->withCount(['userActivityLogs'])->latest()->get()->map(function ($row) {
                            return [
                                'value' => $row->id,
                                'label' => $row->username,
                                'count' => $row->user_activity_logs_count,
                            ];
                        }),
                    ],
                ]
            )
        ]);
    }

    public function signup(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('log.user.signup.access'), 403);
        if ($request->has('page')) {
            $tableItems = UserSignupLog::with('user')->when($request->input(), function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.user_id')) {
                    $query->whereIn('user_id', explode(',', $request->input('filter.user_id')));
                }
                if ($request->input('filter.search')) {
                    $query->whereAny([
                        'id',
                        'ip_address',
                        'user_agent',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                $item->makeVisible(['id']);
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('admin/log/user/signup', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'users' => [
                        'filters' => User::has('userSignupLogs')->withCount(['userSignupLogs'])->latest()->get()->map(function ($row) {
                            return [
                                'value' => $row->id,
                                'label' => $row->username,
                                'count' => $row->user_signup_logs_count,
                            ];
                        }),
                    ],
                ]
            )
        ]);
    }


    public function balance(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('log.user.balance.access'), 403);
        if ($request->has('page')) {
            $applyFilters = function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.user_id')) {
                    $query->whereIn('user_id', explode(',', $request->input('filter.user_id')));
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
            $tableItems = UserBalanceLog::with('user')->when($request->input(), $applyFilters)->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $summary = UserBalanceLog::select(
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
        return inertia('admin/log/user/balance', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'users' => User::has('userBalanceLogs')->withCount(['userBalanceLogs'])->latest()->get()->map(function ($row) {
                        return [
                            'value' => $row->id,
                            'label' => $row->username,
                            'count' => $row->user_balance_logs_count,
                        ];
                    }),
                    'types' => UserBalanceLog::distinct()->get(['type'])
                        ->map(function ($row) {
                            return [
                                'value' => $row->type,
                                'label'   => BalanceEnum::getValue('ARRAY_TYPE_LABELS')[$row->type],
                                'count' => UserBalanceLog::where('type', $row->type)->count(),
                            ];
                        }),
                    'categories' => UserBalanceLog::distinct()->get(['category'])
                        ->map(function ($row) {
                            return [
                                'value' => $row->category,
                                'label'   => BalanceEnum::getValue('ARRAY_CATEGORY_LABELS')[$row->category],
                                'count' => UserBalanceLog::where('category', $row->category)->count(),
                            ];
                        }),
                ]
            )
        ]);
    }
}

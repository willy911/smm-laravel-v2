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

namespace App\Http\Controllers\Admin;

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
use App\Models\User\User;
use App\Models\User\UserBalanceLog;
use App\Services\Admin\Deposit\DepositService;
use App\Services\Admin\PaymentMethodService;
use App\Services\Admin\User\UserService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class DepositController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update']),
        ];
    }

    public function index(Request $request, UserService $userService, PaymentMethodService $paymentMethodService)
    {
        abort_unless(auth('admin')->user()->hasRole('deposit.access'), 403);
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
        return inertia('admin/deposit/index', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'users' => [
                        'options' => $userService->getOptions(),
                        'filters' => $userService->getFilters(),
                    ],
                    'paymentMethods' => [
                        'options' => $paymentMethodService->getOptions(),
                        'filters' => $paymentMethodService->onlyRelated('deposits')->getFilters(),
                    ],
                    // 'paymentMethods' => PaymentMethod::whereHas('deposits')->withCount(['deposits'])->latest('id')->get()->map(function ($row) {
                    //     return [
                    //         'value'   => $row->id,
                    //         'label'   => $row->name,
                    //         'count'   => $row->deposits_count,
                    //     ];
                    // }),
                ],
            )
        ]);
    }

    public function store(DepositRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('deposit.create'), 403);
        $credentials = [
            'user_id' => $request->input('user.id'),
            'payment_method_id' => 0,
            'amount'            => $request->input('deposit.amount'),
            'bonus'             => $request->input('deposit.bonus'),
            'total_payment'     => $request->input('deposit.amount'),
            'total_balance'     => $request->input('deposit.amount') + $request->input('deposit.bonus'),
            'unique_code'       => 0,
            'admin_fee'         => 0,
            'is_manual'         => 1,
            'status'            => 'success',
            'payment_gateway_api_log' => (object) [],
        ];
        $user = User::find($credentials['user_id']);
        // $paymentMethod = PaymentMethod::find($credentials['payment_method_id']);
        $credentials['payment_method_name'] = 'Manual';
        $credentials['initial_balance'] = $user->balance;
        $credentials['final_balance'] = $user->balance + $credentials['amount'];
        $user->update([
            'balance' => $credentials['final_balance']
        ]);
        $insertData = Deposit::create($credentials);
        $insertBalanceLog = UserBalanceLog::create([
            'user_id'         => $credentials['user_id'],
            'type'            => 'credit',
            'category'        => 'deposit',
            'amount'          => $credentials['total_balance'],
            'initial_balance' => $credentials['initial_balance'],
            'final_balance'   => $credentials['final_balance'],
            'content_key'  => 'deposits:log.process-successful',
            'content_params'  => (object) ['deposit_id' => $insertData->id],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.create_successful', [
                'item' => __('common.labels.deposit'),
                'id' => $insertData->id,
            ]),
        ]);
    }

    public function create()
    {
        return inertia('user/deposit/create', [
            'pageProps' => Inertia::defer(
                function () {
                    $pageProps['paymentMethods'] = PaymentMethod::where('status', '1')
                        ->where('minimum', '>=', auth()->user()->userGroup->minimum_deposit)
                        ->distinct()
                        ->oldest('type')
                        ->get(['type'])
                        ->map(function ($row) {
                            return [
                                'value'   => $row->type,
                                'label'   => PaymentMethodEnum::getValue('ARRAY_TYPE_LABELS')[$row->type],
                                'options' => PaymentMethod::where('type', $row->type)
                                    ->where('status', '1')
                                    ->where('minimum', '>=', auth()->user()->userGroup->minimum_deposit)
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
                            ['status', 'pending'],
                        ])->first()
                    ];
                },
            )
        ]);
    }

    public function show(Deposit $target)
    {
        // abort_if($target->user_id <> auth()->id(), 404);
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
            } else {
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
            }
        }
        if ($target->is_manual === 1) {
            $pageProps['paymentTarget'] = $target->payment_information;
        }
        return inertia('User/Deposit/Detail', $pageProps);
    }

    public function switch(Deposit $target, $columnName, $columnValue)
    {
        abort_unless(auth('admin')->user()->hasRole('deposit.update'), 403);
        if ($columnName == 'status') {
            $columnNameLabel = 'Status';
            $from = DepositEnum::getValue('ARRAY_STATUS_LABELS')[$target->status];
            $to   = DepositEnum::getValue('ARRAY_STATUS_LABELS')[$columnValue];
        }
        if (in_array($target->status, ['success', 'canceled'])) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.exception')
            ], 500);
        }
        if ($target->update([$columnName => $columnValue])) {
            if ($columnValue === 'canceled') {
                $insertActivityLog = UserActivityLog::create([
                    'user_id'    => $target->user_id,
                    'ip_address' => $target->ip_address,
                    'user_agent' => $target->user_agent,
                    'content_key'  => 'deposits:log.cancel-successful',
                    'content_params'  => (object) ['deposit_id' => $target->id],
                ]);
            }
            if ($columnValue === 'success') {
                $initialBalance = $target->user->balance;
                $finalBalance = $target->user->balance + $target->total_balance;
                $target->user->update([
                    'balance' => $finalBalance
                ]);
                $insertBalanceLog = UserBalanceLog::create([
                    'user_id'         => $target->user_id,
                    'type'            => 'credit',
                    'category'        => 'deposit',
                    'amount'          => $target->total_balance,
                    'initial_balance' => $initialBalance,
                    'final_balance'   => $finalBalance,
                    'content_key'  => 'deposits:log.process-successful',
                    'content_params'  => (object) ['deposit_id' => $target->id],
                ]);
                if ($target->user->upline) {
                    $commissionAmount = ((website_config('affiliate')->commission / 100) * $target->amount);
                    $initialCommission = $target->user->upline->commission;
                    $finalCommission = $initialCommission + $commissionAmount;
                    $deductCommission = $target->user->upline->update([
                        'commission'   => $finalCommission,
                    ]);
                    $insertBalanceLog = UserBalanceLog::create([
                        'user_id'         => $target->user->upline->id,
                        'type'            => 'credit',
                        'category'        => 'commission',
                        'amount'          => $commissionAmount,
                        'initial_balance' => $initialCommission,
                        'final_balance'   => $finalCommission,
                        'content_key'  => 'affiliate:log.commission-received',
                        'content_params'  => (object) ['amount' => $commissionAmount, 'user' => $target->user->full_name],
                    ]);
                }
            }
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

    public function report(Request $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);

        if ($request->has('page') || $request->has('from')) {
            $reportData = $this->depositReportData($request);
            return response()->json([
                'status' => true,
                'report' => $reportData['report'],
                'data'   => $reportData['rows'],
            ]);
        }

        return inertia('admin/deposit/report', [
            'pageProps' => Inertia::defer(
                fn() => $this->depositReportData(request()),
            ),
        ]);
    }

    /**
     * Data laporan deposit: ringkasan per status + daftar transaksi (maks. 500 terbaru).
     */
    private function depositReportData(Request $request): array
    {
        $tableItemsQuery = Deposit::query();
        if ($request->filled(['from', 'to'])) {
            $tableItemsQuery->whereBetween(DB::raw('DATE(created_at)'), [
                date('Y-m-d', strtotime($request->input('from'))),
                date('Y-m-d', strtotime($request->input('to'))),
            ]);
        } elseif ($request->filled('from')) {
            $tableItemsQuery->whereDate(
                'created_at',
                date('Y-m-d', strtotime($request->input('from'))),
            );
        }

        $summaryItems = (clone $tableItemsQuery)->get([
            'id',
            'amount',
            'status',
        ]);
        $report = [
            'total' => [
                'total' => $summaryItems->count(),
                'amount' => round((float) $summaryItems->sum('amount'), 2),
            ],
            'pending' => [
                'total' => $summaryItems->where('status', 'pending')->count(),
                'amount' => round((float) $summaryItems->where('status', 'pending')->sum('amount'), 2),
            ],
            'success' => [
                'total' => $summaryItems->where('status', 'success')->count(),
                'amount' => round((float) $summaryItems->where('status', 'success')->sum('amount'), 2),
            ],
            'failed' => [
                'total' => $summaryItems->whereIn('status', ['expired', 'canceled'])->count(),
                'amount' => round((float) $summaryItems->whereIn('status', ['expired', 'canceled'])->sum('amount'), 2),
            ],
        ];

        $rows = (clone $tableItemsQuery)->with('user:id,username')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(500)
            ->get([
                'id',
                'user_id',
                'payment_method_name',
                'amount',
                'status',
                'created_at',
            ])
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'created_at' => (string) $row->created_at,
                    'user' => [
                        'id' => $row->user_id,
                        'username' => $row->user->username ?? null,
                    ],
                    'payment_method_name' => $row->payment_method_name,
                    'amount' => round((float) $row->amount, 2),
                    'status' => $row->status,
                ];
            })
            ->values()
            ->all();

        return [
            'report' => $report,
            'rows'   => $rows,
        ];
    }
}

class DepositRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('deposit.access')
                && $admin->hasRole('deposit.update');
        }

        return $admin->hasRole('deposit.access')
            && $admin->hasRole('deposit.create');
    }

    public function rules(Request $request)
    {
        $paymentMethod = PaymentMethod::find($request->input('payment_method.id'));
        return [
            // 'payment_method.id' => ['required', 'exists:payment_methods,id'],
            'user.id' => ['required', 'exists:users,id'],
            'deposit.display_amount' => [
                'required',
                'numeric',
            ],
            'deposit.display_bonus' => [
                'required',
                'numeric',
            ],
        ];
    }

    public function attributes()
    {
        return [
            'user.id'      => __('common.labels.user'),
            'payment_method.id'      => __('common.labels.payment_method'),
            'deposit.display_amount' => __('common.labels.amount'),
            'deposit.display_bonus'  => __('common.labels.bonus'),
        ];
    }
}

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

namespace App\Http\Controllers\Admin\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\Order\StoreRequest;
use App\Models\Order\Order;
use App\Models\Service\Service;
use App\Models\Service\ServiceCategoryGroup;
use App\Models\Service\ServiceCustomPrice;
use App\Models\Service\ServiceProviderResponse;
use App\Models\User\User;
use App\Models\User\UserActivityLog;
use App\Models\User\UserBalanceLog;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use App\Services\Admin\Order\OrderService;
use App\Tables\User\Order as OrderTable;
use App\Enums\Order\Order as OrderEnum;
use App\Jobs\SendApiOrderRequest;
use App\Models\Admin\AdminActivityLog;
use App\Models\Order\OrderCancel;
use App\Models\Order\OrderRefill;
use App\Models\Service\ServiceProvider;
use App\Models\Website\WebsiteSitemap;
use App\Rules\MassOrder;
use App\Rules\UpdateBatchOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\Mailer\Transport\SendmailTransportFactory;
use Illuminate\Http\Client\Pool;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('order.access'), 403);
        if ($request->has('page')) {
            $orderService = new OrderService($request);
            $tableItems = $orderService->getTableItems();
            $summary = $orderService->getSummary();
            return response()->json([
                'status' => true,
                'data' => $tableItems,
                'summary' => $summary,
            ]);
        }
        return inertia('admin/order/index', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'users' => User::whereHas('orders')->withCount(['orders'])->latest('id')->limit(100)->get()->map(function ($row) {
                        return [
                            'value'   => $row->id,
                            'label'   => $row->username,
                            'count'   => $row->orders_count,
                        ];
                    }),
                    'services' => Service::whereHas('orders')->withCount(['orders'])->latest('id')->limit(100)->get()->map(function ($row) {
                        return [
                            'value'   => $row->id,
                            'label'   => $row->name,
                            'count'   => $row->orders_count,
                        ];
                    }),
                    'serviceProviders' => ServiceProvider::whereHas('orders')->withCount(['orders'])->latest('id')->limit(100)->get()->map(function ($row) {
                        return [
                            'value'   => $row->id,
                            'label'   => $row->alias,
                            'count'   => $row->orders_count,
                        ];
                    }),
                ],
            )
        ]);
    }

    public function update(OrderUpdateRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('order.update'), 403);
        $validated = $request->validated();
        $ids = [];
        $startCounts = array_values(array_filter(
            preg_split('/\r\n|\r|\n/', $validated['order']['start_counts']),
            fn($line) => trim($line) !== ''
        ));
        $remains = array_values(array_filter(
            preg_split('/\r\n|\r|\n/', $validated['order']['remains']),
            fn($line) => trim($line) !== ''
        ));
        DB::transaction(function () use ($validated, $startCounts, $remains, &$ids) {
            foreach ($validated['order']['ids'] as $index => $orderId) {
                $order = Order::find($orderId);
                $order->update([
                    'start_count' => (int) $startCounts[$index],
                    'remains' => (int) $remains[$index],
                ]);
                $ids[] = $order->id;
            }
        });

        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.update_successful', [
                'item' => __('common.labels.orders'),
                'id'   => implode(', ', $ids),
            ]),
        ]);
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('order.update'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.invalid_id'),
            ], 400);
        }
        $targets = Order::with('user')->whereIn('id', $ids)->get();
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
                if (in_array($target->status, ['canceled', 'partial', 'error'])) continue;
                if (in_array($columnValue, ['canceled', 'partial', 'error'])) {
                    $refundAmount = ($target->price / $target->quantity) * $target->remains;
                    $reduceProfit = ($target->profit / $target->quantity) * $target->remains;
                    if ($target->remains == 0 || $target->remains > $target->quantity) {
                        $refundAmount = $target->price;
                        $reduceProfit = $target->profit;
                    }
                    $initialBalance = $target->user->balance;
                    $target->user->increment('balance', $refundAmount);
                    $finalBalance = $initialBalance + $refundAmount;
                    $insertBalanceLog = UserBalanceLog::create([
                        'user_id'         => $target->user_id,
                        'type'            => 'credit',
                        'category'        => 'order',
                        'amount'          => $refundAmount,
                        'initial_balance' => $initialBalance,
                        'final_balance'   => $finalBalance,
                        'content_key'  => 'orders:log.refund-successful',
                        'content_params'  => (object) ['order_id' => $target->id],
                    ]);
                    if ($from != $columnValue) {
                        $target->update([
                            'status' => $columnValue,
                            'is_refunded' => '1',
                            'profit' => $target->profit - $reduceProfit,
                            'price' => $target->price - $refundAmount,
                        ]);
                    }
                } else {
                    if ($from != $columnValue) {
                        $target->update([$columnName => $columnValue]);
                    }
                }
            } else {
                if ($from != $columnValue) {
                    $target->update([$columnName => $columnValue]);
                }
            }
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.switch_successful', [
                'item' => __('common.labels.order'),
                'id' => implode(', ', $ids),
                'column' => __('common.labels.' . $columnNameLabel . ''),
            ]),
        ]);
    }

    public function report(Request $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);

        if ($request->has('page') || $request->has('from')) {
            $reportData = $this->orderReportData($request);
            return response()->json([
                'status' => true,
                'report' => $reportData['report'],
                'data'   => $reportData['rows'],
            ]);
        }

        return inertia('admin/order/report', [
            'pageProps' => Inertia::defer(
                fn() => $this->orderReportData(request()),
            ),
        ]);
    }

    /**
     * Data laporan pesanan: ringkasan per status + daftar transaksi (maks. 500 terbaru).
     */
    private function orderReportData(Request $request): array
    {
        $tableItemsQuery = Order::query();
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
            'price',
            'profit',
            'status',
        ]);
        $report = [
            'total' => [
                'total' => $summaryItems->count(),
                'price' => round((float) $summaryItems->sum('price'), 2),
            ],
            'pending' => [
                'total' => $summaryItems->where('status', 'pending')->count(),
                'price' => round((float) $summaryItems->where('status', 'pending')->sum('price'), 2),
            ],
            'processing' => [
                'total' => $summaryItems->whereIn('status', ['processing', 'in_progress'])->count(),
                'price' => round((float) $summaryItems->whereIn('status', ['processing', 'in_progress'])->sum('price'), 2),
            ],
            'completed' => [
                'total' => $summaryItems->where('status', 'completed')->count(),
                'price' => round((float) $summaryItems->where('status', 'completed')->sum('price'), 2),
                'profit' => round((float) $summaryItems->where('status', 'completed')->sum('profit'), 2),
            ],
            'failed' => [
                'total' => $summaryItems->whereIn('status', ['partial', 'error'])->count(),
                'price' => round((float) $summaryItems->whereIn('status', ['partial', 'error'])->sum('price'), 2),
            ],
        ];

        $rows = (clone $tableItemsQuery)->with('user:id,username')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(500)
            ->get([
                'id',
                'user_id',
                'service_id',
                'service_name',
                'target',
                'quantity',
                'price',
                'profit',
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
                    'service_id' => $row->service_id,
                    'service_name' => $row->service_name,
                    'target' => $row->target,
                    'quantity' => (float) $row->quantity,
                    'price' => round((float) $row->price, 2),
                    'profit' => round((float) $row->profit, 2),
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

class OrderUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('order.access')
                && $admin->hasRole('order.update');
        }

        return $admin->hasRole('order.access')
            && $admin->hasRole('order.create');
    }

    public function rules()
    {
        return [
            'order' => ['required', 'array'],
            'order.ids.*' => [
                'required',
                'exists:orders,id',
            ],
            'order.start_counts' => [
                'required',
                new UpdateBatchOrder()
            ],
            'order.remains' => [
                'required',
                new UpdateBatchOrder()
            ],
        ];
    }

    public function attributes()
    {
        return [
            'order.ids.*' => __('common.labels.id'),
            'order.start_counts' => __('common.labels.start_count'),
            'order.remains' => __('common.labels.remains'),
        ];
    }
}

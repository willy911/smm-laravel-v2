<?php

namespace App\Services\User;

use App\Models\Order\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class OrderService
{
    protected Request $request;
    protected int $userId;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->userId = auth()->id();
    }

    private function applyFilters($query)
    {
        if ($this->request->filled('filter.created_at.start') && $this->request->filled('filter.created_at.end')) {
            $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($this->request->input('filter.created_at.start'))));
            $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($this->request->input('filter.created_at.end'))));
        } elseif ($this->request->filled('filter.created_at.start') && !$this->request->filled('filter.created_at.end')) {
            $query->whereDate('created_at', date('Y-m-d', strtotime($this->request->input('filter.created_at.start'))));
        }
        if ($this->request->filled('filter.updated_at.start') && $this->request->filled('filter.updated_at.end')) {
            $query->whereDate('updated_at', '>=', date('Y-m-d', strtotime($this->request->input('filter.updated_at.start'))));
            $query->whereDate('updated_at', '<=', date('Y-m-d', strtotime($this->request->input('filter.updated_at.end'))));
        } elseif ($this->request->filled('filter.updated_at.start') && !$this->request->filled('filter.updated_at.end')) {
            $query->whereDate('updated_at', date('Y-m-d', strtotime($this->request->input('filter.updated_at.start'))));
        }
        if ($this->request->filled('filter.status')) {
            $query->whereIn('status', explode(',', $this->request->input('filter.status')));
        }
        if ($this->request->filled('filter.service_id')) {
            $query->whereIn('service_id', explode(',', $this->request->input('filter.service_id')));
        }
        if ($this->request->filled('filter.ordered_via')) {
            $query->whereIn('ordered_via', explode(',', $this->request->input('filter.ordered_via')));
        }
        if ($this->request->filled('filter.search')) {
            $searchTerm = $this->request->input('filter.search');
            if (is_numeric($searchTerm)) {
                $query->where('id', (int) $searchTerm);
            } elseif (preg_match('/^(\d+(,\s*\d+)*)$/', $searchTerm)) {
                $ids = array_map('trim', explode(',', $searchTerm));
                $query->whereIn('id', $ids);
            } else {
                $query->whereLike('target', '%' . $searchTerm . '%');
            }
        }
        return $query;
    }

    public function getTableItems(): LengthAwarePaginator
    {
        $cacheTag = 'user_orders:' . $this->userId;
        $tableItemsCacheKeyData = [
            'user_id' => $this->userId,
            'filters' => $this->request->only([
                'filter.created_at.start',
                'filter.created_at.end',
                'filter.updated_at.start',
                'filter.updated_at.end',
                'filter.status',
                'filter.service_id',
                'filter.ordered_via',
                'filter.search'
            ]),
            'order_column' => $this->request->input('order.column'),
            'order_direction' => $this->request->input('order.direction'),
            'page' => $this->request->input('page', 1),
            'length' => $this->request->input('length'),
        ];
        $tableItemsCacheKey = 'user_order_table_items_' . md5(json_encode($tableItemsCacheKeyData));
        $tableItemsCacheTtl = Carbon::now()->addHours(6);
        // return Cache::tags($cacheTag)->remember($tableItemsCacheKey, $tableItemsCacheTtl, function () {
        // return Cache::remember($tableItemsCacheKey, $tableItemsCacheTtl, function () {
        $items = Order::with([
            'service.serviceProvider',
            'orderRefills',
            'orderCancel'
        ])
            ->where('user_id', $this->userId)
            ->when($this->request->input(), fn($query) => $this->applyFilters($query))
            ->orderBy($this->request->input('order.column'), $this->request->input('order.direction'))
            ->paginate($this->request->input('length'))
            ->onEachSide(1);
        $items->getCollection()->transform(function ($item) {
            $item->order_refill_button_label_info = $item->orderRefillButtonLabelInfo;
            $item->order_cancel_button_label_info = $item->orderCancelButtonLabelInfo;
            return $item;
        });
        return $items;
        // });
    }

    public function getSummary(): array
    {
        $cacheTag = 'user_orders:' . $this->userId;
        $summaryCacheKeyData = [
            'user_id' => $this->userId,
            'filters' => $this->request->only([
                'filter.created_at.start',
                'filter.created_at.end',
                'filter.updated_at.start',
                'filter.updated_at.end',
                'filter.status',
                'filter.service_id',
                'filter.ordered_via',
                'filter.search'
            ]),
        ];
        $summaryCacheKey = 'user_order_summary_' . md5(json_encode($summaryCacheKeyData));
        $summaryCacheTtl = Carbon::now()->addHours(6);
        // return Cache::tags($cacheTag)->remember($summaryCacheKey, $summaryCacheTtl, function () {
        // return Cache::remember($summaryCacheKey, $summaryCacheTtl, function () {
        $results = Order::where('user_id', $this->userId)->select(
            DB::raw("
                    CASE
                        WHEN status IN ('partial', 'error', 'canceled') THEN 'failed'
                        WHEN status IN ('processing', 'in_progress') THEN 'processing'
                        ELSE status
                    END as custom_status
                "),
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(price) as amount')
        )
            ->when($this->request->input(), fn($query) => $this->applyFilters($query))
            ->groupBy('custom_status')
            ->get();

        $transformedResults = $results->mapWithKeys(function ($item) {
            return [
                $item->custom_status => [
                    'count' => $item->count,
                    'amount' => $item->amount,
                ]
            ];
        });

        $finalSummary = [
            'total'      => ['count' => $transformedResults->sum('count'), 'amount' => $transformedResults->sum('amount')],
            'pending'    => $transformedResults['pending'] ?? ['count' => 0, 'amount' => 0],
            'processing' => $transformedResults['processing'] ?? ['count' => 0, 'amount' => 0],
            'completed'  => $transformedResults['completed'] ?? ['count' => 0, 'amount' => 0],
            'failed'     => $transformedResults['failed'] ?? ['count' => 0, 'amount' => 0],
        ];

        return $finalSummary;
        // });
    }

    public static function invalidateUserOrdersCache(int $userId): void
    {
        // Cache::tags([
        //     'user_orders:' . $userId,
        //     'user_leaderboard',
        //     'admin_orders',
        //     'admin_leaderboard',
        // ])->flush();
    }
}

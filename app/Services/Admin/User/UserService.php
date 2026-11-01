<?php

namespace App\Services\Admin\User;

use App\Models\User\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    private function applyFilters($query)
    {
        if ($this->request->has('onlyRelated')) $query->has($this->request->input('onlyRelated'));
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
        if ($this->request->filled('filter.deleted_at.start') && $this->request->filled('filter.deleted_at.end')) {
            $query->whereDate('deleted_at', '>=', date('Y-m-d', strtotime($this->request->input('filter.deleted_at.start'))));
            $query->whereDate('deleted_at', '<=', date('Y-m-d', strtotime($this->request->input('filter.deleted_at.end'))));
        } elseif ($this->request->filled('filter.deleted_at.start') && !$this->request->filled('filter.deleted_at.end')) {
            $query->whereDate('deleted_at', date('Y-m-d', strtotime($this->request->input('filter.deleted_at.start'))));
        }
        if ($this->request->filled('filter.user_group_id')) {
            $query->whereIn('user_group_id', explode(',', $this->request->input('filter.user_group_id')));
        }
        if ($this->request->filled('filter.status')) {
            $query->whereIn('status', explode(',', $this->request->input('filter.status')));
        }
        if ($this->request->filled('filter.search')) {
            $searchTerm = $this->request->input('filter.search');
            if (is_numeric($searchTerm)) {
                $query->where('id', (int) $searchTerm);
            } elseif (preg_match('/^(\d+(,\s*\d+)*)$/', $searchTerm)) {
                $ids = array_map('trim', explode(',', $searchTerm));
                $query->whereIn('id', $ids);
            } else {
                $query->whereAny([
                    'id',
                    'full_name',
                    'username',
                    'email',
                    'whatsapp',
                    'balance',
                ], 'LIKE', '%' . $searchTerm . '%');
            }
        }
        return $query;
    }

    public function getTableItems(): LengthAwarePaginator
    {
        $cacheTag = 'admin_users';
        $tableItemsCacheKeyData = [
            'filters' => $this->request->only([
                'filter.created_at.start',
                'filter.created_at.end',
                'filter.updated_at.start',
                'filter.updated_at.end',
                'filter.deleted_at.start',
                'filter.deleted_at.end',
                'filter.user_group_id',
                'filter.status',
                'filter.search'
            ]),
            'order_column' => $this->request->input('order.column', 'id'),
            'order_direction' => $this->request->input('order.direction', 'desc'),
            'page' => $this->request->input('page', 1),
            'length' => $this->request->input('length', 10),
        ];
        $tableItemsCacheKey = 'admin_user_table_items_' . md5(json_encode($tableItemsCacheKeyData));
        $tableItemsCacheTtl = Carbon::now()->addHours(6);
        // return Cache::tags($cacheTag)->remember($tableItemsCacheKey, $tableItemsCacheTtl, function () {
        // return Cache::remember($tableItemsCacheKey, $tableItemsCacheTtl, function () {
        $items = User::withTrashed()->with(['upline', 'userGroup', 'referrals', 'userSigninLogs' => function ($query) {
            $query->latest()->limit(1);
        }])
            ->when($this->request->input(), fn($query) => $this->applyFilters($query))
            ->orderBy($this->request->input('order.column', 'id'), $this->request->input('order.direction', 'desc'))
            ->paginate($this->request->input('length', 10))
            ->onEachSide(1);
        $items->getCollection()->transform(function ($item) {
            $item->user_signin_log = $item->userSigninLogs->first();
            $item->user_group = $item->userGroup;
            $item->total_referrals = $item->referrals()->count();
            $item->setVisible([
                'id',
                'user_group',
                'user_group_id',
                'created_at',
                'updated_at',
                'deleted_at',
                'full_name',
                'username',
                'email',
                'whatsapp',
                'balance',
                'service_discount',
                'status',
                'email_verified_at',
                'whatsapp_verified_at',
                'user_signin_log',
                'referral_code',
                'upline',
                'total_referrals'
            ]);
            return $item;
        });
        return $items;
        // });
    }

    public function getSummary(): array
    {
        $cacheTag = 'admin_users';
        $summaryCacheKeyData = [
            'filters' => $this->request->only([
                'filter.created_at.start',
                'filter.created_at.end',
                'filter.updated_at.start',
                'filter.updated_at.end',
                'filter.deleted_at.start',
                'filter.deleted_at.end',
                'filter.user_group_id',
                'filter.status',
                'filter.search'
            ]),
        ];
        $summaryCacheKey = 'admin_user_summary_' . md5(json_encode($summaryCacheKeyData));
        $summaryCacheTtl = Carbon::now()->addHours(6);
        // return Cache::tags($cacheTag)->remember($summaryCacheKey, $summaryCacheTtl, function () {
        // return Cache::remember($summaryCacheKey, $summaryCacheTtl, function () {
        $results = User::withTrashed()->select(
            DB::raw("
                        CASE 
                            WHEN status = 0 THEN 'inactive' 
                            WHEN status = 1 THEN 'active' 
                            ELSE status 
                        END as custom_status
                    "),
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(balance) as amount')
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
            'active'  => $transformedResults['active'] ?? ['count' => 0, 'amount' => 0],
            'inactive'     => $transformedResults['inactive'] ?? ['count' => 0, 'amount' => 0],
        ];

        return $finalSummary;
        // });
    }

    public static function invalidateAdminUsersCache(): void
    {
        // Cache::tags('admin_users')->flush();
    }



    public function getOptions(): array
    {
        return User::when($this->request->input(), fn($query) => $this->applyFilters($query))->latest()->get()->map(function ($row) {
            return [
                'value' => $row->id,
                'label' => $row->username,
            ];
        })->toArray();
    }

    public function getFilters(): array
    {
        return User::has('deposits')->withCount(['deposits'])->latest()->get()->map(function ($row) {
            return [
                'value' => $row->id,
                'label' => $row->username,
                'count'   => $row->deposits_count,
            ];
        })->toArray();
    }
}

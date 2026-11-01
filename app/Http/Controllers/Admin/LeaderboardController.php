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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function __invoke(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('leaderboard.access'), 403);
        if ($request->has('render')) {
            // $data = Cache::tags('admin_leaderboard')->remember('admin_leaderboard_' . $request->input('month'), now()->addHours(6), function () use ($request) {
            // $data = Cache::remember('admin_leaderboard_' . $request->input('month'), now()->addHours(6), function () use ($request) {
            $month = $request->input('month');
            $year  = now()->year;
            $orders = User::join('orders', 'users.id', '=', 'orders.user_id')
                ->where('orders.status', 'completed')
                ->whereMonth('orders.created_at', $month)
                ->whereYear('orders.created_at', $year)
                ->groupBy('users.full_name', 'users.id')
                ->select('users.full_name', 'users.id', DB::raw('SUM(orders.price) AS amount'), DB::raw('COUNT(orders.id) AS count'))
                ->orderByDesc('amount')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'amount'    => $item->amount,
                        'count'     => $item->count,
                        'full_name' => $item->full_name,
                    ];
                });
            $deposits = User::join('deposits', 'users.id', '=', 'deposits.user_id')
                ->where('deposits.status', 'success')
                ->whereMonth('deposits.created_at', $month)
                ->whereYear('deposits.created_at', $year)
                ->groupBy('users.full_name', 'users.id')
                ->select('users.full_name', 'users.id', DB::raw('SUM(deposits.amount) AS amount'), DB::raw('COUNT(deposits.id) AS count'))
                ->orderByDesc('amount')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'amount'    => $item->amount,
                        'count'     => $item->count,
                        'full_name' => $item->full_name,
                    ];
                });
            $services = Order::where('status', 'completed')
                ->whereMonth('orders.created_at', $month)
                ->whereYear('orders.created_at', $year)
                ->select('service_id', 'service_name', DB::raw('SUM(price) as amount'), DB::raw('COUNT(id) as count'))
                ->groupBy('service_id', 'service_name')
                ->orderByDesc('amount')
                ->limit(10)
                ->get();
            $data =  [
                'orders'   => $orders,
                'deposits' => $deposits,
                'services' => $services,
            ];
            return response()->json([
                'status'  => true,
                'data'    => $data,
            ]);
            // });
        }
        return inertia('admin/leaderboard');
    }

    public function getUserDataForPeriod($relation, $sumColumn, $status, $startOfMonth, $endOfMonth)
    {
        $query = User::whereHas($relation, function ($query) use ($startOfMonth, $endOfMonth, $status) {
            $query->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->where('status', $status);
        });

        return $query->with([
            "{$relation}:id,created_at,status,{$sumColumn}",
        ])->withCount([$relation => function ($query) use ($startOfMonth, $endOfMonth, $status) {
            $query->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->where('status', $status);
        }])->withSum([$relation => function ($query) use ($startOfMonth, $endOfMonth, $status) {
            $query->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->where('status', $status);
        }], $sumColumn)
            ->orderByDesc("{$relation}_sum_{$sumColumn}")
            ->limit(10)
            ->get(['id', 'full_name', "{$relation}_count", "{$relation}_sum_{$sumColumn}"])
            ->toArray();
    }

    public function getServiceDataForPeriod($sumColumn, $status, $startOfMonth, $endOfMonth)
    {
        return Service::whereHas('orders', function ($query) use ($startOfMonth, $endOfMonth, $status) {
            $query->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->where('status', $status);
        })->withCount(['orders' => function ($query) use ($startOfMonth, $endOfMonth, $status) {
            $query->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->where('status', $status);
        }])->withSum(['orders' => function ($query) use ($startOfMonth, $endOfMonth, $status) {
            $query->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->where('status', $status);
        }], $sumColumn)
            ->orderByDesc('orders_count')
            ->limit(10)
            ->get(['id', 'name', 'orders_count', "orders_sum_{$sumColumn}"])
            ->toArray();
    }
}

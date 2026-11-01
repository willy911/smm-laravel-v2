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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function __invoke()
    {
        return inertia('user/leaderboard', [
            'pageProps' => Inertia::defer(
                // fn() => Cache::tags('user_leaderboard')->remember('user_leaderboard', now()->addHours(6), function () {
                fn() => Cache::remember('user_leaderboard', now()->addHours(6), function () {
                    $orders = User::whereBetween('orders.created_at', [now()->startOfMonth(), now()->endOfMonth()])
                        ->join('orders', 'users.id', '=', 'orders.user_id')
                        ->latest('amount')
                        ->where('orders.status', 'completed')
                        ->groupBy('users.full_name', 'users.id')
                        ->limit('10')
                        ->get(['users.full_name', 'users.id', User::raw('SUM(orders.price) AS amount')])->map(function ($item) {
                            return [
                                'amount' => $item->amount,
                                'full_name' => maskFullName($item->full_name),
                            ];
                        });
                    $deposits = User::whereBetween('deposits.created_at', [now()->startOfMonth(), now()->endOfMonth()])
                        ->join('deposits', 'users.id', '=', 'deposits.user_id')
                        ->latest('amount')
                        ->where('deposits.status', 'success')
                        ->groupBy('users.full_name', 'users.id')
                        ->limit('10')
                        ->get(['users.full_name', 'users.id', User::raw('SUM(deposits.amount) AS amount')])->map(function ($item) {
                            return [
                                'amount' => $item->amount,
                                'full_name' => maskFullName($item->full_name),
                            ];
                        });
                    $services = Order::whereBetween('orders.created_at', [now()->startOfMonth(), now()->endOfMonth()])
                        ->select('service_id', 'service_name', DB::raw('SUM(price) as amount'))
                        ->where('status', 'completed')
                        ->groupBy('service_id', 'service_name')
                        ->orderByDesc('amount')
                        ->limit(10)
                        ->get();
                    return [
                        'orders' => $orders,
                        'deposits' => $deposits,
                        'services' => $services,
                    ];
                }),
            )
        ]);
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

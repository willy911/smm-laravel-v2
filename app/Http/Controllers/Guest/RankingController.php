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

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Deposit\Deposit;
use App\Models\Order\Order;
use App\Models\Service\Service;
use App\Models\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RankingController extends Controller
{
    /**
     * Halaman Peringkat (guest, tanpa auth). Tidak memakai tabel leaderboards:
     * semua peringkat dihitung live-query bulan ini, pola sama dengan
     * Admin\LeaderboardController + User\LeaderboardController.
     */
    public function __invoke(Request $request)
    {
        return inertia('guest/ranking', [
            'pageProps' => Inertia::defer(function () {
                return [
                    'orders' => $this->getTopOrders(),
                    'deposits' => $this->getTopDeposits(),
                    'services' => $this->getTopServices(),
                ];
            }),
        ]);
    }

    /**
     * Top 10 pengguna berdasarkan total harga pesanan (status completed) bulan ini.
     * Hanya mengekspos full_name (dimask), amount, dan count.
     */
    private function getTopOrders()
    {
        return User::join('orders', 'users.id', '=', 'orders.user_id')
            ->where('orders.status', 'completed')
            ->whereMonth('orders.created_at', now()->month)
            ->whereYear('orders.created_at', now()->year)
            ->groupBy('users.full_name', 'users.id')
            ->select('users.full_name', 'users.id', DB::raw('SUM(orders.price) AS amount'), DB::raw('COUNT(orders.id) AS count'))
            ->orderByDesc('amount')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'amount' => $item->amount,
                    'count' => $item->count,
                    'full_name' => maskFullName($item->full_name),
                ];
            });
    }

    /**
     * Top 10 pengguna berdasarkan total deposit (status success) bulan ini.
     * Hanya mengekspos full_name (dimask), amount, dan count.
     */
    private function getTopDeposits()
    {
        return User::join('deposits', 'users.id', '=', 'deposits.user_id')
            ->where('deposits.status', 'success')
            ->whereMonth('deposits.created_at', now()->month)
            ->whereYear('deposits.created_at', now()->year)
            ->groupBy('users.full_name', 'users.id')
            ->select('users.full_name', 'users.id', DB::raw('SUM(deposits.amount) AS amount'), DB::raw('COUNT(deposits.id) AS count'))
            ->orderByDesc('amount')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'amount' => $item->amount,
                    'count' => $item->count,
                    'full_name' => maskFullName($item->full_name),
                ];
            });
    }

    /**
     * Top 10 layanan berdasarkan jumlah pesanan (status completed) bulan ini,
     * pola getServiceDataForPeriod (withCount/withSum) milik smm.
     * Hanya mengekspos nama layanan, jumlah pesanan, dan total nilai.
     */
    private function getTopServices()
    {
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        return Service::whereHas('orders', function ($query) use ($startOfMonth, $endOfMonth) {
            $query->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->where('status', 'completed');
        })->withCount(['orders' => function ($query) use ($startOfMonth, $endOfMonth) {
            $query->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->where('status', 'completed');
        }])->withSum(['orders' => function ($query) use ($startOfMonth, $endOfMonth) {
            $query->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->where('status', 'completed');
        }], 'price')
            ->orderByDesc('orders_count')
            ->limit(10)
            ->get(['id', 'name', 'orders_count', 'orders_sum_price'])
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'count' => (int) $item->orders_count,
                    'amount' => $item->orders_sum_price,
                ];
            });
    }
}

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

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Models\Deposit\Deposit;
use App\Models\Order\Order;
use App\Models\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        if ($request->has('render')) {
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();

            $aggregatedData = $this->getAggregatedData($startOfMonth, $endOfMonth);

            $result = $this->getMonthlyData($startOfMonth, $aggregatedData);
            return response()->json([
                'status'  => true,
                'data'    => [
                    'charts'        => $result,
                    'lastUsers'     => User::latest()->limit(5)->get(),
                    'totalOrders'   => $this->getOrderSumByStatus('completed'),
                    'lastOrders'    => Order::with(['service', 'user'])->latest()->limit(5)->get(),
                    'totalDeposits' => $this->getDepositSumByStatus('success'),
                    'lastDeposits'  => Deposit::with(['user'])->latest()->limit(5)->get(),
                    'users'         => $this->getUserSummary(),
                    'orders'        => $this->getOrderSummary(),
                    'deposits'      => $this->getDepositSummary(),
                ],
            ]);
        }
        return inertia('admin/dashboard');
    }

    protected function getAggregatedData($startOfMonth, $endOfMonth)
    {
        $users = User::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->selectRaw('DATE_FORMAT(created_at, "%d") as date, COUNT(id) as user_count')
            ->groupBy('date')
            ->pluck('user_count', 'date')
            ->toArray();

        $orders = Order::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->selectRaw('DATE_FORMAT(created_at, "%d") as date, COUNT(id) as order_count')
            ->groupBy('date')
            ->pluck('order_count', 'date')
            ->toArray();

        $deposits = Deposit::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->selectRaw('DATE_FORMAT(created_at, "%d") as date, COUNT(id) as deposit_count')
            ->groupBy('date')
            ->pluck('deposit_count', 'date')
            ->toArray();

        return compact('users', 'orders', 'deposits');
    }

    protected function getMonthlyData($startOfMonth, $aggregatedData)
    {
        $result = [];
        $daysInMonth = $startOfMonth->daysInMonth;
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = Carbon::createFromDate(null, null, $i);
            $formattedDate = $date->translatedFormat('j F Y');
            $result[] = [
                'date' => $formattedDate,
                'user' => $aggregatedData['users'][str_pad($i, 2, '0', STR_PAD_LEFT)] ?? 0,
                'order' => $aggregatedData['orders'][str_pad($i, 2, '0', STR_PAD_LEFT)] ?? 0,
                'deposit' => $aggregatedData['deposits'][str_pad($i, 2, '0', STR_PAD_LEFT)] ?? 0,
            ];
        }
        return $result;
    }

    protected function getOrderSumByStatus($status)
    {
        return Order::where('status', $status)->sum('price');
    }

    protected function getDepositSumByStatus($status)
    {
        return Deposit::where('status', $status)->sum('amount');
    }

    protected function getUserSummary()
    {
        return [
            'total' => [
                'total'   => User::count('id'),
                'balance' => User::sum('balance'),
            ],
            'active' => [
                'total'   => User::where('status', 'active')->count('id'),
                'balance' => User::where('status', 'active')->sum('balance'),
            ],
            'disabled' => [
                'total'   => User::where('status', 'disabled')->count('id'),
                'balance' => User::where('status', 'disabled')->sum('balance'),
            ],
        ];
    }

    protected function getOrderSummary()
    {
        $statuses = ['pending', 'processing', 'completed', 'failed'];
        $result = [];
        foreach ($statuses as $status) {
            $result[$status] = [
                'total' => Order::where('status', $status)->count('id'),
                'price' => Order::where('status', $status)->sum('price'),
            ];
        }
        $result['success'] = [
            'total' => Order::where('status', 'completed')->count('id'),
            'price' => Order::where('status', 'completed')->sum('price'),
        ];
        $result['failed'] = [
            'total' => Order::whereIn('status', ['partial', 'error'])->count('id'),
            'price' => Order::whereIn('status', ['partial', 'error'])->sum('price'),
        ];
        $result['total'] = [
            'total' => Order::count('id'),
            'price' => Order::sum('price'),
        ];
        return $result;
    }

    protected function getDepositSummary()
    {
        $statuses = ['pending', 'success', 'failed'];
        $result = [];
        foreach ($statuses as $status) {
            $result[$status] = [
                'total'  => Deposit::where('status', $status)->count('id'),
                'amount' => Deposit::where('status', $status)->sum('amount'),
            ];
        }
        $result['total'] = [
            'total'  => Deposit::count('id'),
            'amount' => Deposit::sum('amount'),
        ];
        return $result;
    }
}

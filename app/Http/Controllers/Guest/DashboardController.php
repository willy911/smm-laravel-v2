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
use App\Http\Controllers\User\Auth\DashboardController as UserDashboardController;
use App\Models\Order\Order;
use App\Models\Service\Service;
use App\Models\Service\ServiceRecommendation;
use App\Models\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        if (Auth::check()) return (new UserDashboardController())->__invoke($request);
        return inertia('guest/dashboard', [
            'pageProps' => Inertia::defer(
                fn() => Cache::remember('landing_page', now()->addHours(6), function () {
                    $serviceBestSellings = Service::withWhereHas('orders', function ($query) {
                        $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])->select('id', 'service_id', 'quantity', 'created_at', 'updated_at')->where('status', 'completed')->latest('id')->limit(10);
                    })->limit(10)->latest()->get()->map(function ($row) {
                        return [
                            'id'   => $row->id,
                            'name' => $row->name,
                            'price'   => $row->price,
                            'is_recommended' => $row->is_recommended,
                            'is_best_seller' => $row->is_best_seller,
                            'refill_days' => $row->refill_days,
                            'is_refill_support' => $row->is_refill_support,
                            'is_cancel_support' => $row->is_cancel_support,
                            'min' => $row->min,
                            'max' => $row->max,
                            'type' => $row->type,
                            'avg_quantity' => $row->get_avg_quantity,
                            'avg_time' => $row->get_avg_time,
                        ];
                    });
                    $serviceRecommendations = Service::with(['orders' => function ($query) {
                        $query->select('id', 'service_id', 'quantity', 'created_at', 'updated_at')->where('status', 'completed')->latest('id')->limit(10);
                    }])->where('is_recommended', '1')->limit(10)->latest()->get()->map(function ($row) {
                        return [
                            'id'   => $row->id,
                            'name' => $row->name,
                            'price'   => $row->price,
                            'is_recommended' => $row->is_recommended,
                            'is_best_seller' => $row->is_best_seller,
                            'refill_days' => $row->refill_days,
                            'is_refill_support' => $row->is_refill_support,
                            'is_cancel_support' => $row->is_cancel_support,
                            'min' => $row->min,
                            'max' => $row->max,
                            'type' => $row->type,
                            'avg_quantity' => $row->get_avg_quantity,
                            'avg_time' => $row->get_avg_time,
                        ];
                    });
                    return [
                        'serviceBestSellings' => $serviceBestSellings,
                        'serviceRecommendations' => $serviceRecommendations,
                    ];
                }),
            )
        ]);
    }
}

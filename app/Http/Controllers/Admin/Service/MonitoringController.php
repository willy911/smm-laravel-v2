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

namespace App\Http\Controllers\Admin\Service;

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
use App\Tables\User\Order as OrderTable;
use App\Enums\Order\Order as OrderEnum;
use App\Jobs\SendApiOrderRequest;
use App\Models\Website\WebsiteSitemap;
use App\Rules\MassOrder;
use Carbon\CarbonInterval;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\Mailer\Transport\SendmailTransportFactory;

class MonitoringController extends Controller
{
    public function __invoke(Request $request)
    {
        $countOrders = Order::where('status', 'completed')->count();
        if ($request->has('page')) {
            $applyFilters = function ($query) use ($request, $countOrders) {
                $query->where('status', 'completed');
                if ($countOrders > 10000) {
                    $query->where('created_at', '>=', now()->startOfDay());
                    $query->where('created_at', '<=', now()->addDay()->startOfDay());
                }
                if ($request->filled('filter.service_id')) {
                    $query->whereIn('service_id', explode(',', $request->input('filter.service_id')));
                }
                if ($request->filled('filter.search')) {
                    $query->whereAny([
                        'service_id',
                        'service_name',
                        'target',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            };
            $tableItems = Order::with([
                'service',
            ])->when($request->input(), $applyFilters)->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                $item->id = $item->service_id;
                $item->process_time = $item->processTime;
                return $item;
            });
            return response()->json([
                'status' => true,
                'data' => $tableItems,
            ]);
        }
        return inertia('admin/service/monitoring', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'services' => Service::whereHas('orders', function ($query) use ($countOrders) {
                        $query->where('status', 'completed');
                        if ($countOrders > 10000) {
                            $query->where('created_at', '>=', now()->startOfDay());
                            $query->where('created_at', '<=', now()->addDay()->startOfDay());
                        }
                    })->withCount([
                        'orders' => function ($query) use ($countOrders) {
                            $query->where('status', 'completed');
                            if ($countOrders > 10000) {
                                $query->where('created_at', '>=', now()->startOfDay());
                                $query->where('created_at', '<=', now()->addDay()->startOfDay());
                            }
                        }
                    ])->latest('id')->limit(100)->get()->map(function ($row) {
                        return [
                            'value'   => $row->id,
                            'label'   => $row->name,
                            'count'   => $row->orders_count,
                        ];
                    }),
                ],
            )
        ]);
    }
}

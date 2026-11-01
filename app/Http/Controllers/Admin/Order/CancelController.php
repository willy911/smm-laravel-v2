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
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\Mailer\Transport\SendmailTransportFactory;
use Illuminate\Http\Client\Pool;

class CancelController extends Controller
{
    public function store(Request $request)
    {
        if (RateLimiter::tooManyAttempts($rateKey = 'order-cancel-create', 5)) {
            $seconds = RateLimiter::availableIn($rateKey);
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.throttle', ['seconds' => $seconds]),
            ], 429);
        }
        RateLimiter::hit($rateKey);
        $orderIds = $request->input('order_id', []);
        if (!is_array($orderIds) || empty($orderIds)) {
            RateLimiter::clear($rateKey);
            return response()->json([
                'status'  => false,
                'message' => __('orders.toast.invalid_order_id'),
            ], 400);
        }
        $orders = Order::with([
            'service.serviceProvider.serviceProviderConfiguration',
            'orderCancel',
        ])->whereIn('id', $orderIds)->get();
        $filteredOrders = collect($orders)->filter(function ($order) {
            if ($order->status !== 'pending') {
                return false;
            }
            $service = $order->service;
            if (!$service || !$service->is_cancel_support) {
                return false;
            }
            $serviceProvider = optional($service)->serviceProvider;
            if (!$serviceProvider || $serviceProvider->type !== 'auto' || !$serviceProvider->is_cancel_support) {
                return false;
            }
            $serviceProviderConfig = optional($order->service->serviceProvider->serviceProviderConfiguration->order_cancel_create_configuration);
            if (!$serviceProviderConfig->method || !$serviceProviderConfig->endpoint) {
                return false;
            }
            if (now()->lessThan(Carbon::parse($order->created_at)->addHour())) {
                return false;
            }
            if ($order->orderCancel) {
                return false;
            }
            return true;
        });
        $responses = Http::pool(
            fn(Pool $pool) =>
            collect($filteredOrders)->map(function ($order) use ($pool) {
                $serviceProviderConfig = optional($order->service->serviceProvider->serviceProviderConfiguration->order_cancel_create_configuration);
                $formData = collect($serviceProviderConfig->params)->mapWithKeys(function ($param) use ($order) {
                    if ($param->type === 'custom') {
                        return [$param->key => $param->value];
                    }
                    if ($param->type === 'default_parameter') {
                        return [
                            $param->key => collect($order->service->serviceProvider->default_parameters)
                                ->pluck('value', 'key')
                                ->get($param->key)
                        ];
                    }
                    if (!in_array($param->type, ['custom', 'default_parameter'])) {
                        return [$param->key => strtr($param->type, [
                            'order_id'          => $order->service_provider_order_id,
                        ])];
                    }
                    return [];
                })->toArray();
                return $pool
                    ->as($order->id)
                    ->withOptions(['timeout' => 300, 'verify' => false])
                    ->send(
                        $serviceProviderConfig->method,
                        $serviceProviderConfig->endpoint,
                        [
                            'form_params' => $formData
                        ]
                    );
            })->all()
        );
        foreach ($responses as $orderId => $response) {
            $order = $filteredOrders->firstWhere('id', $orderId);
            $credentials = [
                'user_id'             => $order->user_id,
                'order_id'            => $order->id,
                'service_id'          => $order->service_id,
                'ip_address'          => $request->ip(),
                'user_agent'          => $request->header('User-Agent'),
            ];
            if ($response->ok() == true) {
                $order->updated_at = now();
                $order->save();
                $serviceProviderOrderCancelID = data_get($response->object(), $order->service->serviceProvider->serviceProviderConfiguration->order_cancel_create_configuration->parse_response->order_cancel_id);
                $credentials['service_provider_order_cancel_id'] = $serviceProviderOrderCancelID;
                $credentials['service_provider_order_cancel_log'] = $response->json();
                if ($serviceProviderOrderCancelID) {
                    $insertOrderCancel = OrderCancel::create($credentials);
                    $insertActivityLog = AdminActivityLog::create([
                        'admin_id'   => auth('admin')->user()->id,
                        'ip_address'  => $credentials['ip_address'],
                        'user_agent'  => $credentials['user_agent'],
                        'content_key'  => 'orders:log.cancel-successful',
                        'content_params'  => (object) ['order_cancel_id' => $insertOrderCancel->id ?? 0],
                    ]);
                } else {
                    // $insertServiceProviderResponse = ServiceProviderResponse::create([
                    //     'type'                => 'order_cancel_create',
                    //     'status'              => 'fail',
                    //     'user_id'             => $credentials['user_id'],
                    //     'order_id'            => $order->id,
                    //     'service_id'          => $order->service->id,
                    //     'service_provider_id' => $order->service->service_provider_id,
                    //     'logs'                => $response->json(),
                    // ]);
                }
            } else {
                // $insertServiceProviderResponse = ServiceProviderResponse::create([
                //     'type'                => 'order_cancel_create',
                //     'status'              => 'fail',
                //     'user_id'             => $credentials['user_id'],
                //     'order_id'            => $order->id,
                //     'service_id'          => $order->service->id,
                //     'service_provider_id' => $order->service->service_provider_id,
                //     'logs'                => $response->json(),
                // ]);
            }
            // Cache::tags([
            //     'user_orders:' . $credentials['user_id'],
            // ])->flush();
        }
        $orderService = new OrderService($request);
        $orderService->invalidateUserOrdersCache();
        return response()->json([
            'status'  => true,
            'message' => __('orders.toast.cancel_successful')
        ]);
    }
}

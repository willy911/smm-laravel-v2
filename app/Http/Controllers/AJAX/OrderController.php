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

namespace App\Http\Controllers\AJAX;

use App\Http\Controllers\Controller;
use App\Models\Order\Order;
use App\Models\Service\ServiceProviderResponse;
use App\Models\User\UserActivityLog;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use App\Tables\User\OrderRefill as OrderRefillTable;
use App\Enums\Order\OrderRefill as OrderRefillEnum;
use App\Models\Order\OrderCancel;
use App\Models\Order\OrderRefill;
use App\Services\User\OrderService;
use Carbon\CarbonInterval;
use Illuminate\Http\Client\Pool;

class OrderController extends Controller
{
    public function storeRefill(Request $request)
    {
        if (RateLimiter::tooManyAttempts($rateKey = 'order-refill-create:' . auth()->id(), 5)) {
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
            'orderRefills' => fn($query) => $query->latest('id')->limit(1),
        ])->where('user_id', auth()->id())->whereIn('id', $orderIds)->get();
        $filteredOrders = collect($orders)->filter(function ($order) {
            if ($order->status !== 'completed') {
                return false;
            }
            $service = $order->service;
            if (!$service || !$service->is_refill_support) {
                return false;
            }
            $serviceProvider = optional($service)->serviceProvider;
            if (!$serviceProvider || $serviceProvider->type !== 'auto' || !$serviceProvider->is_refill_support) {
                return false;
            }
            $serviceProviderConfig = optional($order->service->serviceProvider->serviceProviderConfiguration->order_refill_create_configuration);
            if (!$serviceProviderConfig->method || !$serviceProviderConfig->endpoint) {
                return false;
            }
            if (filled($service->refill_days) && Carbon::parse($order->created_at)->diffInDays(now()) > $service->refill_days) {
                return false;
            }
            if (filled($service->refill_available_in_hours) && Carbon::parse($order->created_at)->diffInHours(now()) < $service->refill_available_in_hours) {
                return false;
            }
            $refill = $order->orderRefills->first();
            if ($refill) {
                if (in_array($refill->status, ['pending', 'processing', 'in_progress'])) {
                    return false;
                }
                if (
                    $refill->status === 'completed' &&
                    Carbon::parse($refill->created_at)->diffInHours(now()) < 24
                ) {
                    return false;
                }
            }
            return true;
        });
        $responses = Http::pool(
            fn(Pool $pool) =>
            collect($filteredOrders)->map(function ($order) use ($pool) {
                $serviceProviderConfig = optional($order->service->serviceProvider->serviceProviderConfiguration->order_refill_create_configuration);
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
                if ($serviceProviderOrderRefillID = data_get($response->object(), $order->service->serviceProvider->serviceProviderConfiguration->order_refill_create_configuration->parse_response->order_refill_id)) {
                    $credentials['service_provider_order_refill_id'] = $serviceProviderOrderRefillID;
                    $credentials['service_provider_order_refill_log'] = $response->json();
                }
                if ($serviceProviderOrderRefillID) {
                    $insertOrderRefill = OrderRefill::create($credentials);
                    $insertActivityLog = UserActivityLog::create([
                        'user_id'     => $credentials['user_id'],
                        'ip_address'  => $credentials['ip_address'],
                        'user_agent'  => $credentials['user_agent'],
                        'content_key'  => 'orders:log.refill-successful',
                        'content_params'  => (object) ['order_refill_id' => $insertOrderRefill->id],
                    ]);
                    $insertServiceProviderResponse = ServiceProviderResponse::create([
                        'type'                => 'order_refill_create',
                        'status'              => 'success',
                        'user_id'             => $credentials['user_id'],
                        'order_id'            => $order->id,
                        'order_refill_id'     => $insertOrderRefill->id,
                        'service_id'          => $order->service->id,
                        'service_provider_id' => $order->service->service_provider_id,
                        'logs'                => $response->json(),
                    ]);
                } else {
                    $insertServiceProviderResponse = ServiceProviderResponse::create([
                        'type'                => 'order_refill_create',
                        'status'              => 'fail',
                        'user_id'             => $credentials['user_id'],
                        'order_id'            => $order->id,
                        'service_id'          => $order->service->id,
                        'service_provider_id' => $order->service->service_provider_id,
                        'logs'                => $response->json(),
                    ]);
                }
            } else {
                $insertServiceProviderResponse = ServiceProviderResponse::create([
                    'type'                => 'order_refill_create',
                    'status'              => 'fail',
                    'user_id'             => $credentials['user_id'],
                    'order_id'            => $order->id,
                    'service_id'          => $order->service->id,
                    'service_provider_id' => $order->service->service_provider_id,
                    'logs'                => $response->json(),
                ]);
            }
        }
        $orderService = new OrderService($request);
        $orderService->invalidateUserOrdersCache(auth('web')->id());
        return response()->json([
            'status'  => true,
            'message' => __('orders.toast.refill_successful')
        ]);
    }

    public function storeCancel(Request $request)
    {
        if (RateLimiter::tooManyAttempts($rateKey = 'order-cancel-create:' . auth()->id(), 5)) {
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
        ])->where('user_id', auth()->id())->whereIn('id', $orderIds)->get();
        $filteredOrders = collect($orders)->filter(function ($order) {
            // Cancel boleh diajukan selama status belum terminal
            // (pending, processing, in_progress) — tanpa jendela tunggu 1 jam.
            if (!in_array($order->status, ['pending', 'processing', 'in_progress'])) {
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
                    $insertActivityLog = UserActivityLog::create([
                        'user_id'     => $credentials['user_id'],
                        'ip_address'  => $credentials['ip_address'],
                        'user_agent'  => $credentials['user_agent'],
                        'content_key'  => 'orders:log.cancel-successful',
                        'content_params'  => (object) ['order_cancel_id' => $insertOrderCancel->id],
                    ]);
                    $insertServiceProviderResponse = ServiceProviderResponse::create([
                        'type'                => 'order_cancel_create',
                        'status'              => 'success',
                        'user_id'             => $credentials['user_id'],
                        'order_id'            => $order->id,
                        'order_cancel_id'     => $insertOrderCancel->id,
                        'service_id'          => $order->service->id,
                        'service_provider_id' => $order->service->service_provider_id,
                        'logs'                => $response->json(),
                    ]);
                } else {
                    $insertServiceProviderResponse = ServiceProviderResponse::create([
                        'type'                => 'order_cancel_create',
                        'status'              => 'fail',
                        'user_id'             => $credentials['user_id'],
                        'order_id'            => $order->id,
                        'service_id'          => $order->service->id,
                        'service_provider_id' => $order->service->service_provider_id,
                        'logs'                => $response->json(),
                    ]);
                }
            } else {
                $insertServiceProviderResponse = ServiceProviderResponse::create([
                    'type'                => 'order_cancel_create',
                    'status'              => 'fail',
                    'user_id'             => $credentials['user_id'],
                    'order_id'            => $order->id,
                    'service_id'          => $order->service->id,
                    'service_provider_id' => $order->service->service_provider_id,
                    'logs'                => $response->json(),
                ]);
            }
        }
        $orderService = new OrderService($request);
        $orderService->invalidateUserOrdersCache(auth('web')->id());
        return response()->json([
            'status'  => true,
            'message' => __('orders.toast.cancel_successful')
        ]);
    }
}

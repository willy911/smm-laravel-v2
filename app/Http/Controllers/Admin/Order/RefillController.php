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
use App\Models\Admin\AdminActivityLog;
use App\Models\Order\OrderRefill;
use App\Models\Service\ServiceProvider;
use App\Models\User\User;
use App\Services\Admin\Order\OrderService;
use Carbon\CarbonInterval;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class RefillController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('order.refill.access'), 403);
        if ($request->has('page')) {
            $tableItems = OrderRefill::with(['service.serviceProvider', 'user'])->withWhereHas('order')->when($request->input(), function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.updated_at.start') && $request->filled('filter.updated_at.end')) {
                    $query->whereDate('updated_at', '>=', date('Y-m-d', strtotime($request->input('filter.updated_at.start'))));
                    $query->whereDate('updated_at', '<=', date('Y-m-d', strtotime($request->input('filter.updated_at.end'))));
                } elseif ($request->filled('filter.updated_at.start') && !$request->filled('filter.updated_at.end')) {
                    $query->whereDate('updated_at', date('Y-m-d', strtotime($request->input('filter.updated_at.start'))));
                }
                if ($request->filled('filter.user_id')) {
                    $query->whereIn('user_id', explode(',', $request->input('filter.user_id')));
                }
                if ($request->filled('filter.service_id')) {
                    $query->whereIn('service_id', explode(',', $request->input('filter.service_id')));
                }
                if ($request->filled('filter.status')) {
                    $query->whereIn('status', explode(',', $request->input('filter.status')));
                }
                if ($request->filled('filter.search')) {
                    $query->whereAny([
                        'id',
                        'service_provider_order_refill_id',
                        'order_id',
                        'service_id',
                        'status',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                // $item->user?->setVisible([]);
                $item->service?->makeVisible(['serviceProvider']);
                // $item->service?->serviceProvider?->setVisible([]);
                $item->setVisible([]);
                $item->target = $item->order?->target;
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'   => $tableItems,
            ]);
        }
        return inertia('admin/order/refill', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'users' => User::whereHas('orderRefills')->withCount(['orderRefills'])->latest('id')->limit(100)->get()->map(function ($row) {
                        return [
                            'value'   => $row->id,
                            'label'   => $row->username,
                            'count'   => $row->order_refills_count,
                        ];
                    }),
                    'services' => OrderRefill::withWhereHas('service.serviceProvider')->select('service_id')->selectRaw('COUNT(*) as count')->groupBy('service_id')->latest('service_id')->limit(100)->get()->map(function ($row) {
                        return [
                            'value'   => $row->service_id,
                            'label'   => $row->service->name,
                            'count'   => $row->count,
                        ];
                    }),
                ],
            )
        ]);
    }

    public function store(Request $request)
    {
        if (RateLimiter::tooManyAttempts($rateKey = 'order-refill-create', 5)) {
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
        ])->whereIn('id', $orderIds)->get();
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
                    $insertActivityLog = AdminActivityLog::create([
                        'admin_id'   => auth('admin')->user()->id,
                        'ip_address'  => $credentials['ip_address'],
                        'user_agent'  => $credentials['user_agent'],
                        'content_key'  => 'orders:log.refill-successful',
                        'content_params'  => (object) ['order_refill_id' => $insertOrderRefill->id],
                    ]);
                    // Provider menerima permintaan refill (refill_id tersimpan):
                    // catat SPR 'success' dengan order_refill_id sesuai pola AJAX OrderController.
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
                    // Response ok tetapi provider tidak mengembalikan refill_id:
                    // tidak ada OrderRefill tercatat, catat SPR 'fail' agar
                    // terlihat di halaman admin/services/providers/response.
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
                // Provider error (response tidak ok): catat SPR 'fail' tanpa
                // order_refill_id, refill tetap boleh dicoba ulang.
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
            // Cache::tags([
            //     'user_orders:' . $credentials['user_id'],
            // ])->flush();
        }
        $orderService = new OrderService($request);
        $orderService->invalidateUserOrdersCache();
        return response()->json([
            'status'  => true,
            'message' => __('orders.toast.refill_successful')
        ]);
    }
}

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

namespace App\Http\Controllers\API;

use App\Http\Requests\Order\Cancel\CreateRequest;
use App\Http\Requests\Order\StatusRequest;
use App\Http\Requests\Profile\PostRequest;
use App\Models\Deposit\Deposit;
use App\Models\Order\Order;
use App\Models\Order\OrderCancel;
use App\Models\Service\ServiceProviderResponse;
use App\Models\User\User;
use App\Models\User\UserActivityLog;
use Carbon\Carbon;
use Carbon\CarbonInterval;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\Controller;

class OrderCancelController extends Controller
{
    public function create(CreateRequest $request)
    {
        $checkUser = $user = User::whereJsonContains('api->api_key', $request->input('api_key'))->whereJsonContains('api->secret_key', $request->input('secret_key'))->first();
        $checkOrder = $target = Order::where('user_id', $user->id)->where('id', $request->input('id'))->first();
        if ($target->service && Carbon::parse($target->created_at)->diffInHours(Carbon::now()) < 1) {
            return response()->json([
                'status'  => false,
                'message' => 'Cancel Failed',
                'errors'  => [
                    'pembatalan tersedia dalam ' . CarbonInterval::seconds(Carbon::now()->subHours(1)->diffInSeconds($target->created_at))->cascade()->forHumans()
                ]
            ], 422, [], JSON_PRETTY_PRINT);
        }
        $checkOrderCancelExists = $orderCancelExists = OrderCancel::where([
            'user_id' => $user->id,
            'order_id' => $target->id
        ])->latest()->first();
        if ($checkOrderCancelExists) {
            if (Carbon::parse($orderCancelExists->created_at)->diffInHours(Carbon::now()) < 1) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Cancel Failed',
                    'errors'  => [
                        'Coba lagi dalam ' . CarbonInterval::seconds(Carbon::now()->subHours(1)->diffInSeconds($orderCancelExists->created_at))->cascade()->forHumans()
                    ]
                ], 422, [], JSON_PRETTY_PRINT);
            }
        }
        $credentials = [
            'user_id'             => $user->id,
            'order_id'            => $target->id,
            'service_id'          => $target->service_id,
            'ip_address'          => $request->ip(),
            // 'user_agent'          => $request->header('User-Agent'),
        ];
        if ($target->service && $target->service->serviceProvider && $target->service->serviceProvider->serviceProviderConfiguration && $target->service->serviceProvider->type <> 'manual' && $target->service->is_cancel_support === '1') {
            $orderCancelResponse = false;
            try {
                $serviceProviderConfig = optional($target->service->serviceProvider->serviceProviderConfiguration->order_cancel_create_configuration);
                $formData = collect($serviceProviderConfig->params)->mapWithKeys(function ($param) use ($target, $credentials) {
                    if ($param->type === 'custom') {
                        return [$param->key => $param->value];
                    }
                    if ($param->type === 'default_parameter') {
                        return [
                            $param->key => collect($target->service->serviceProvider->default_parameters)
                                ->pluck('value', 'key')
                                ->get($param->key)
                        ];
                    }
                    if (!in_array($param->type, ['custom', 'default_parameter'])) {
                        return [$param->key => strtr($param->type, [
                            'order_id'          => $target->service_provider_order_id,
                        ])];
                    }
                    return [];
                })->toArray();
                $response = Http::withoutVerifying()->send($serviceProviderConfig->method, $serviceProviderConfig->endpoint, [
                    'form_params' => $formData
                ]);
                if ($response->ok() == true) {
                    if ($serviceProviderOrderCancelID = data_get($response->object(), $serviceProviderConfig->parse_response->order_cancel_id)) {
                        $orderCancelResponse = true;
                        $credentials['service_provider_order_cancel_id'] = $serviceProviderOrderCancelID;
                        $credentials['service_provider_order_cancel_log'] = $response->json();
                    }
                } else {
                    // $insertServiceProviderResponse = ServiceProviderResponse::create([
                    //     'type'                => 'order_cancel_create',
                    //     'status'              => 'fail',
                    //     'user_id'             => $credentials['user_id'],
                    //     'service_id'          => $target->service->id,
                    //     'service_provider_id' => $target->service->service_provider_id,
                    //     'logs'                => $response->json(),
                    // ]);
                    return response()->json([
                        'status'  => false,
                        'message' => 'Cancel Failed',
                        'errors'  => [
                            'Pesanan tidak dapat dibatalkan, silahkan coba lagi dalam beberapa saat.'
                        ]
                    ], 422, [], JSON_PRETTY_PRINT);
                }
            } catch (Exception $error) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Cancel Failed',
                    'errors'  => [
                        'Terjadi Kesalahan.'
                    ]
                ], 500, [], JSON_PRETTY_PRINT);
            }
            if ($orderCancelResponse == false) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Cancel Failed',
                    'errors'  => [
                        'Pesanan tidak dapat dibatalkan, silahkan coba lagi dalam beberapa saat.'
                    ]
                ], 422, [], JSON_PRETTY_PRINT);
            } else {
                $insertOrderCancel = OrderCancel::create($credentials);
                if ($insertOrderCancel == true) {
                    // $insertServiceProviderResponse = ServiceProviderResponse::create([
                    //     'type'                => 'order_cancel_create',
                    //     'status'              => 'success',
                    //     'user_id'             => $credentials['user_id'],
                    //     'service_id'          => $target->service->id,
                    //     'service_provider_id' => $target->service->service_provider_id,
                    //     'logs'                => $response->json(),
                    // ]);
                    $insertActivityLog = UserActivityLog::create([
                        'user_id'     => $credentials['user_id'],
                        'ip_address'  => $credentials['ip_address'],
                        'user_agent'  => $credentials['user_agent'],
                        'content_key'  => 'orders:log.cancel-successful',
                        'content_params'  => (object) ['order_cancel_id' => $insertOrderCancel->id],
                    ]);
                    return response()->json([
                        'status' => true,
                        'data'   => [
                            'id' => $insertOrderCancel->id,
                        ],
                    ], 200, [], JSON_PRETTY_PRINT);
                } else {
                    return response()->json([
                        'status'  => false,
                        'message' => 'Cancel Failed',
                        'errors'  => [
                            'Terjadi Kesalahan.'
                        ]
                    ], 500, [], JSON_PRETTY_PRINT);
                }
            }
        } else {
            return response()->json([
                'status'  => false,
                'message' => 'Cancel Failed',
                'errors'  => [
                    'Pesanan tidak dapat dibatalkan.'
                ]
            ], 422, [], JSON_PRETTY_PRINT);
        }
    }
}

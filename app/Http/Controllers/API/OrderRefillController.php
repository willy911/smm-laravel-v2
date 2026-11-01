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

use App\Http\Requests\Order\Refill\CreateRequest;
use App\Http\Requests\Order\Refill\StatusRequest;
use App\Http\Requests\Profile\PostRequest;
use App\Models\Deposit\Deposit;
use App\Models\Order\Order;
use App\Models\Order\OrderRefill;
use App\Models\Service\ServiceProviderResponse;
use App\Models\User\User;
use App\Models\User\UserActivityLog;
use Carbon\Carbon;
use Carbon\CarbonInterval;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\Controller;

class OrderRefillController extends Controller
{
    public function create(CreateRequest $request)
    {
        $checkUser = $user = User::whereJsonContains('api->api_key', $request->input('api_key'))->whereJsonContains('api->secret_key', $request->input('secret_key'))->first();
        $checkOrder = $target = Order::where('user_id', $user->id)->where('id', $request->input('id'))->first();
        if ($checkOrder->status <> 'completed') {
            return response()->json([
                'status'  => false,
                'message' => 'Refill Failed',
                'errors'  => [
                    'Pesanan masih berstatus ' . $checkOrder->status . '.'
                ]
            ], 422, [], JSON_PRETTY_PRINT);
        }
        if ($target->service && $target->service->refill_days && Carbon::parse($target->created_at)->diffInDays(Carbon::now()) > $target->service->refill_days) {
            return response()->json([
                'status'  => false,
                'message' => 'Refill Failed',
                'errors'  => [
                    'Layanan hanya mendukung isi ulang selama ' . $target->service->refill_days . ' hari sejak pesanan dibuat.'
                ]
            ], 422, [], JSON_PRETTY_PRINT);
        }
        if ($target->service && $target->service->refill_available_in_hours && Carbon::parse($target->created_at)->diffInHours(Carbon::now()) < $target->service->refill_available_in_hours) {
            return response()->json([
                'status'  => false,
                'message' => 'Refill Failed',
                'errors'  => [
                    'isi ulang tersedia dalam ' . CarbonInterval::seconds(Carbon::now()->subHours($target->service->refill_available_in_hours)->diffInSeconds($target->created_at))->cascade()->forHumans()
                ]
            ], 422, [], JSON_PRETTY_PRINT);
        }
        $checkOrderRefillExists = $orderRefillExists = OrderRefill::where([
            'user_id' => $user->id,
            'order_id' => $target->id
        ])->latest()->first();
        if ($checkOrderRefillExists && $orderRefillExists->status == 'pending') {
            return response()->json([
                'status'  => false,
                'message' => 'Refill Failed',
                'errors'  => [
                    'Isi ulang pesanan sedang dalam antrian.'
                ]
            ], 422, [], JSON_PRETTY_PRINT);
        }
        if ($checkOrderRefillExists && in_array($orderRefillExists->status, ['processing', 'in_progress'])) {
            return response()->json([
                'status'  => false,
                'message' => 'Refill Failed',
                'errors'  => [
                    'Isi ulang pesanan sedang dalam proses, mohon tunggu proses selesai.'
                ]
            ], 422, [], JSON_PRETTY_PRINT);
        }
        if ($checkOrderRefillExists && $orderRefillExists->status == 'completed') {
            if (Carbon::parse($orderRefillExists->created_at)->diffInDays(Carbon::now()) < 1) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Refill Failed',
                    'errors'  => [
                        'coba lagi dalam ' . CarbonInterval::seconds(Carbon::now()->subHours(24)->diffInSeconds($orderRefillExists->created_at))->cascade()->forHumans()
                    ]
                ], 422, [], JSON_PRETTY_PRINT);
            }
        }
        $credentials = [
            'user_id'             => $user->id,
            'order_id'            => $target->id,
            'service_id'          => $target->service_id,
            'ip_address'          => $request->ip(),
            'user_agent'          => $request->header('User-Agent', null),
        ];
        if ($target->service && $target->service->serviceProvider && $target->service->serviceProvider->serviceProviderConfiguration && $target->service->serviceProvider->type <> 'manual' && $target->service->is_refill_support === '1') {
            $orderRefillRespons = false;
            try {
                $serviceProviderConfig = optional($target->service->serviceProvider->serviceProviderConfiguration->order_refill_create_configuration);
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
                    if ($serviceProviderOrderRefillID = data_get($response->object(), $serviceProviderConfig->parse_response->order_refill_id)) {
                        $orderRefillRespons = true;
                        $credentials['service_provider_order_refill_id'] = $serviceProviderOrderRefillID;
                        $credentials['service_provider_order_refill_log'] = $response->json();
                    }
                } else {
                    // $insertServiceProviderResponse = ServiceProviderResponse::create([
                    //     'type'                => 'order_refill_create',
                    //     'status'              => 'fail',
                    //     'user_id'             => $credentials['user_id'],
                    //     'order_id'            => $target->id,
                    //     'service_id'          => $target->service->id,
                    //     'service_provider_id' => $target->service->service_provider_id,
                    //     'logs'                => $response->json(),
                    // ]);
                    return response()->json([
                        'status'  => false,
                        'message' => 'Refill Failed',
                        'errors'  => [
                            'Pesanan tidak dapat diisi ulang, silahkan coba lagi dalam beberapa saat.'
                        ]
                    ], 422, [], JSON_PRETTY_PRINT);
                }
            } catch (Exception $error) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Refill Failed',
                    'errors'  => [
                        'Terjadi Kesalahan.'
                    ]
                ], 500, [], JSON_PRETTY_PRINT);
            }
            if ($orderRefillRespons == false) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Refill Failed',
                    'errors'  => [
                        'Pesanan tidak dapat diisi ulang, silahkan coba lagi dalam beberapa saat.'
                    ]
                ], 422, [], JSON_PRETTY_PRINT);
            } else {
                $insertOrderRefill = OrderRefill::create($credentials);
                if ($insertOrderRefill == true) {
                    $insertActivityLog = UserActivityLog::create([
                        'user_id'     => $credentials['user_id'],
                        'ip_address'  => $request->ip(),
                        'user_agent'  => $request->header('User-Agent', null),
                        'content_key'  => 'orders:log.refill-successful',
                        'content_params'  => (object) ['order_refill_id' => $insertOrderRefill->id],
                    ]);
                    // $insertServiceProviderResponse = ServiceProviderResponse::create([
                    //     'type'                => 'order_refill_create',
                    //     'status'              => 'success',
                    //     'user_id'             => $credentials['user_id'],
                    //     'order_id'            => $target->id,
                    //     'order_refill_id'     => $insertOrderRefill->id,
                    //     'service_id'          => $target->service->id,
                    //     'service_provider_id' => $target->service->service_provider_id,
                    //     'logs'                => $response->json(),
                    // ]);
                    return response()->json([
                        'status' => true,
                        'data'   => [
                            'id' => $insertOrderRefill->id,
                            'status' => 'pending',
                            'created_at' => $insertOrderRefill->created_at,
                            'updated_at' => $insertOrderRefill->updated_at,
                        ],
                    ], 200, [], JSON_PRETTY_PRINT);
                } else {
                    return response()->json([
                        'status'  => false,
                        'message' => 'Refill Failed',
                        'errors'  => [
                            'Terjadi Kesalahan.'
                        ]
                    ], 500, [], JSON_PRETTY_PRINT);
                }
            }
        } else {
            return response()->json([
                'status'  => false,
                'message' => 'Refill Failed',
                'errors'  => [
                    'Pesanan tidak dapat diisi ulang.'
                ]
            ], 422, [], JSON_PRETTY_PRINT);
        }
    }

    public function status(StatusRequest $request)
    {
        $checkUser = $user = User::whereJsonContains('api->api_key', $request->input('api_key'))
            ->whereJsonContains('api->secret_key', $request->input('secret_key'))
            ->first();

        $orderRefill = OrderRefill::where('user_id', $user->id)
            ->where(function ($query) use ($request) {
                $query->where('id', $request->input('id'));
            })
            ->first();

        if (!$orderRefill) {
            return response()->json([
                'status' => false,
                'message' => 'refill pesanan tidak ditemukan',
                'errors' => [
                    $request->input('id') . ' tidak ditemukan'
                ]
            ], 404, [], JSON_PRETTY_PRINT);
        }

        return response()->json([
            'status' => true,
            'data'   => [
                'id'          => $orderRefill->id,
                'status'          => $orderRefill->status,
                'created_at'      => $orderRefill->created_at->format('Y-m-d H:i:s'),
                'updated_at'      => $orderRefill->updated_at->format('Y-m-d H:i:s'),
            ],
        ], 200, [], JSON_PRETTY_PRINT);
    }
}

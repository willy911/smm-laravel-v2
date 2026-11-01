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

use App\Models\Deposit\Deposit;
use App\Models\Order\Order;
use App\Models\User\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Order\OrderCancel;
use App\Models\Order\OrderRefill;
use App\Models\Service\Service;
use App\Models\Service\ServiceCustomPrice;
use App\Models\User\UserActivityLog;
use App\Models\User\UserBalanceLog;
use App\Rules\MultipleOrderRefID;
use Carbon\CarbonInterval;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Cookie;

class V2Controller extends Controller
{
    public function __invoke(Request $request)
    {
        return match ($request->input('action')) {
            'balance' => $this->profile($request),
            'services' => $this->services($request),
            'add' => $this->createOrder($request),
            'status' => $this->statusOrder($request),
            'refill' => $this->createRefill($request),
            'refill_status' => $this->statusRefill($request),
            default => response()->json([
                'error' => 'Incorrect Request'
            ], 400, [], JSON_PRETTY_PRINT),
        };
    }

    public function profile(Request $request)
    {
        $checkUser = $user = User::with('locale')->whereJsonContains('api->api_key', $request->input('key'))->first();
        return response()->json([
            'balance' => round(
                (float) $user->locale->usd_rate * $user->balance,
                (int) $user->locale->max_decimal_digits
            ),
            'currency' => $user->locale->currency_code,
        ], 200, [], JSON_PRETTY_PRINT);
    }

    public function services(Request $request)
    {
        $checkUser = $user = User::with('locale')->whereJsonContains('api->api_key', $request->input('key'))->first();
        $services = Service::has('serviceCategory')->with(['serviceCategory', 'serviceFavorites' => function ($query) use ($user) {
            $query->where('user_id', $user->id);
        }, 'orders' => function ($query) {
            $query->where('status', 'completed')->latest('id')->take(10);
        }])->get()
            ->map(function ($row) use ($user) {
                return [
                    'service' => $row->id,
                    'name' => $row->name,
                    'type' => $row->type,
                    'category' => $row->serviceCategory->name,
                    'rate' => round(
                        (float) $user->locale->usd_rate * $row->price,
                        (int) $user->locale->max_decimal_digits
                    ),
                    'min' => (string) $row->min,
                    'max' => (string) $row->max,
                    'refill' => (bool) $row->is_refill_support,
                    'cancel' => (bool) $row->is_cancel_support,
                ];
            })
            ->values();

        return response()->json(
            $services,
            200,
            [],
            JSON_PRETTY_PRINT
        );
    }

    public function createOrder(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            OrderCreateValidator::rules($request)
        );
        if ($validator->fails()) {
            return response()->json([
                'error' => 'Incorrect Request'
            ], 400, [], JSON_PRETTY_PRINT);
        }
        $checkUser = $user = User::whereJsonContains('api->api_key', $request->input('key'))->first();
        $credentials = [
            'user_id'             => $user->id,
            'service_provider_id' => 0,
            'service_id'          => escape_input($request->input('service')),
            'target'              => escape_input($request->input('link')),
            'quantity'            => $request->input('quantity'),
            'ip_address'          => $request->ip(),
            'user_agent'          => $request->header('User-Agent', null),
            'initial_balance'     => $user->balance,
            'ordered_via'         => 'api'
        ];
        $checkService = $service = Service::with(['serviceProvider.serviceProviderConfiguration' => function ($query) {
            $query->whereHas('serviceProvider', function ($query) {
                $query->where('status', '1');
            });
        }])->where([
            ['id', $credentials['service_id']],
            ['status', '1'],
        ])->first();
        if (!$checkService) {
            return response()->json([
                'error' => 'Service not available'
            ], 422, [], JSON_PRETTY_PRINT);
        }
        if ($service->type == 'custom_comments') {
            $comments = array_filter(explode("\n", $request->input('comments')), 'trim');
            $credentials['quantity'] = count($comments);
            $credentials['additional_input'] = (object) [
                'label' => 'custom_comments',
                'value' => (object) [
                    'comments' => escape_input(implode("\n", $comments)),
                ],
            ];
        }
        if ($service->type == 'mentions_with_hashtags') {
            $credentials['additional_input'] = (object) [
                'label' => 'mentions_with_hashtags',
                'value' => (object) [
                    'usernames' => escape_input(implode("\n", array_filter(explode("\n", $request->input('usernames')), 'trim'))),
                    'hashtags'  => escape_input(implode("\n", array_filter(explode("\n", $request->input('hashtags')), 'trim'))),
                ],
            ];
        }
        if ($service->type == 'mentions_custom_list') {
            $usernames = array_filter(explode("\n", $request->input('usernames')), 'trim');
            $credentials['quantity'] = count($usernames);
            $credentials['additional_input'] = (object) [
                'label' => 'mentions_custom_list',
                'value' => (object) [
                    'usernames' => escape_input(implode("\n", $usernames)),
                ],
            ];
        }
        if ($service->type == 'mentions_hashtag') {
            $credentials['additional_input'] = (object) [
                'label' => 'mentions_hashtag',
                'value' => (object) [
                    'hashtag' => $request->input('hashtag'),
                ],
            ];
        }
        if (in_array($service->type, ['mentions_user_followers', 'comment_likes'])) {
            $credentials['additional_input'] = (object) [
                'label' => $service->type,
                'value' => (object) [
                    'username' => $request->input('username'),
                ],
            ];
        }
        if ($service->type == 'mentions_media_likers') {
            $credentials['additional_input'] = (object) [
                'label' => 'mentions_media_likers',
                'value' => (object) [
                    'media_url' => $request->input('media_url'),
                ],
            ];
        }
        if ($service->type == 'custom_comments_package') {
            $comments = array_filter(explode("\n", $request->input('comments')), 'trim');
            $credentials['additional_input'] = (object) [
                'label' => 'custom_comments_package',
                'value' => (object) [
                    'comments' => escape_input(implode("\n", $comments)),
                ],
            ];
        }
        if ($service->type == 'poll') {
            $credentials['additional_input'] = (object) [
                'label' => 'poll',
                'value' => (object) [
                    'answer_number' => $request->input('answer_number'),
                ],
            ];
        }
        if ($service->type == 'comment_replies') {
            $comments = array_filter(explode("\n", $request->input('comments')), 'trim');
            $credentials['quantity'] = count($comments);
            $credentials['additional_input'] = (object) [
                'label' => 'comment_replies',
                'value' => (object) [
                    'username' => $request->input('username'),
                    'comments' => escape_input(implode("\n", $comments)),
                ],
            ];
        }
        $credentials['service_provider_id'] = $service->service_provider_id;
        $credentials['service_name'] = $service->name;
        $credentials['remains'] = $credentials['quantity'];
        $credentials['price'] = $service->price / 1000 * $credentials['quantity'];
        $credentials['profit'] = $service->profit / 1000 * $credentials['quantity'];
        if (in_array($service->type, ['package', 'custom_comments_package'])) {
            $credentials['price'] = $service->price;
            $credentials['profit'] = $service->profit;
        }
        $checkCustomPrice = $customPrice = ServiceCustomPrice::where([
            ['user_group_id', $user->user_group_id],
            ['service_id', $credentials['service_id']]
        ])->first();
        if ($checkCustomPrice == true && $customPrice->price_configs->price < $service->price) {
            $credentials['price'] = $customPrice->price_configs->price / 1000 * $credentials['quantity'];
            $credentials['profit'] = $customPrice->price_configs->profit / 1000 * $credentials['quantity'];
            if (in_array($service->type, ['package', 'custom_comments_package'])) {
                $credentials['price'] = $customPrice->price_configs->price;
                $credentials['profit'] = $customPrice->price_configs->profit;
            }
        }
        if ($user->service_discount > 0) {
            $credentials['price'] -= (
                $credentials['price'] *
                ($user->service_discount / 100)
            );
            $credentials['profit'] -= (
                $credentials['profit'] *
                ($user->service_discount / 100)
            );
        }
        $credentials['final_balance'] = $credentials['initial_balance'] - $credentials['price'];
        // info($credentials);
        if ($credentials['quantity'] < $service->min) {
            return response()->json([
                'status' => false,
                'message' => 'Transaction Failed',
                'errors' => [
                    'Jumlah minimal adalah ' . format_amount($service->min) . '.'
                ]
            ], 400, [], JSON_PRETTY_PRINT);
        }
        if ($credentials['quantity'] > $service->max) {
            return response()->json([
                'status' => false,
                'message' => 'Transaction Failed',
                'errors' => [
                    'Jumlah maksimal adalah ' . format_amount($service->max) . '.'
                ]
            ], 400, [], JSON_PRETTY_PRINT);
        }
        if ($user->balance < $credentials['price']) {
            return response()->json([
                'status' => false,
                'message' => 'Transaction Failed',
                'errors' => [
                    'Saldo anda tidak mencukupi.'
                ]
            ], 422, [], JSON_PRETTY_PRINT);
        }
        $orderResponse = false;
        $insertOrder = Order::create($credentials);
        // $response = Http::withoutVerifying()->post('https://wuzzpanel.com/api/create-order', [
        //     'api_key'  => config('app.wuzzpanel_api_key'),
        //     'panel_id' => config('app.wuzzpanel_panel_id'),
        //     'order_id' => $insertOrder->id,
        //     'price'    => $credentials['price'],
        // ]);
        // $data = $response->json();
        // if (!isset($data['status']) || !$data['status']) {
        //     $insertOrder->delete();
        //     return response()->json([
        //         'error' => 'Service not available'
        //     ], 422, [], JSON_PRETTY_PRINT);
        // }
        if ($service->serviceProvider->type == 'manual') {
            $orderResponse = true;
            $credentials['service_provider_order_id'] = 1;
        } else {
            $orderResponse = true;
            // try {
            //     $serviceProviderConfig = optional($service->serviceProvider->serviceProviderConfiguration->order_create_configuration);
            //     $formData = collect($serviceProviderConfig->params)->mapWithKeys(function ($param) use ($service, $credentials) {
            //         if ($param->type === 'custom') {
            //             return [$param->key => $param->value];
            //         }
            //         if ($param->type === 'default_parameter') {
            //             return [
            //                 $param->key => collect($service->serviceProvider->default_parameters)
            //                     ->pluck('value', 'key')
            //                     ->get($param->key)
            //             ];
            //         }
            //         if (!in_array($param->type, ['custom', 'default_parameter'])) {
            //             return [$param->key => strtr($param->type, [
            //                 'service_id'          => $service->service_provider_service_id,
            //                 'order_target'        => $credentials['target'],
            //                 'order_quantity'      => $credentials['quantity'],
            //                 'order_comments'      => (in_array($service->type, ['custom_comments', 'custom_comments_package', 'comment_replies'])) ? json_decode($credentials['additional_input'], true)['value']['comments'] : null,
            //                 'order_usernames'     => (in_array($service->type, ['mentions_custom_list', 'mentions_with_hashtags'])) ? json_decode($credentials['additional_input'], true)['value']['usernames'] : null,
            //                 'order_username'      => (in_array($service->type, ['mentions_user_followers', 'comment_likes', 'comment_replies'])) ? json_decode($credentials['additional_input'], true)['value']['username'] : null,
            //                 'order_hashtags'      => ($service->type == 'mentions_with_hashtags') ? json_decode($credentials['additional_input'], true)['value']['hashtags'] : null,
            //                 'order_hashtag'       => ($service->type == 'mentions_hashtag') ? json_decode($credentials['additional_input'], true)['value']['hashtag'] : null,
            //                 'order_media_url'     => ($service->type == 'mentions_media_likers') ? json_decode($credentials['additional_input'], true)['value']['media_url'] : null,
            //                 'order_answer_number' => ($service->type == 'poll') ? json_decode($credentials['additional_input'], true)['value']['answer_number'] : null,
            //             ])];
            //         }
            //         return [];
            //     })->toArray();
            //     $curl = post_curl($serviceProviderConfig->endpoint, $formData);
            //     $curl_response = json_decode($curl, true);
            //     // $response = Http::withoutVerifying()->send($serviceProviderConfig->method, $serviceProviderConfig->endpoint, [
            //     //     'form_params' => $formData
            //     // ]);
            //     if (is_array($curl_response)) {
            //         if ($serviceProviderOrderID = data_get($curl_response, $serviceProviderConfig->parse_response->order_id, false)) {
            //             $orderResponse = true;
            //             $credentials['service_provider_order_id'] = $serviceProviderOrderID;
            //             $credentials['service_provider_order_log'] = $curl;
            //         }
            //     }
            // } catch (Exception $error) {
            //     return response()->json([
            //         'status' => false,
            //         'message' => 'Transaction Failed',
            //         'errors' => [
            //             'Terjadi Kesalahan.'
            //         ]
            //     ], 500, [], JSON_PRETTY_PRINT);
            // }
        }
        if ($orderResponse == false) {
            // if ($service->serviceProvider->type === 'auto') {
            //     $insertServiceProviderResponse = ServiceProviderResponse::create([
            //         'type'                => 'order_create',
            //         'status'              => 'fail',
            //         'user_id'             => $credentials['user_id'],
            //         'service_id'          => $service->id,
            //         'service_provider_id' => $service->service_provider_id,
            //         'logs'                => $curl,
            //     ]);
            // }
            // info($formData);
            return response()->json([
                'error' => 'Service not available'
            ], 422, [], JSON_PRETTY_PRINT);
        } else {
            if ($insertOrder == true) {
                $user->update([
                    'balance' => $credentials['final_balance'],
                ]);
                $insertBalanceLog = UserBalanceLog::create([
                    'user_id'         => $credentials['user_id'],
                    'type'            => 'debit',
                    'category'        => 'order',
                    'amount'          => $credentials['price'],
                    'initial_balance' => $credentials['initial_balance'],
                    'final_balance'   => $credentials['final_balance'],
                    'content_key'  => 'orders:log.create-api-successful',
                    'content_params'  => (object) ['order_id' => $insertOrder->id],
                ]);
                $insertActivityLog = UserActivityLog::create([
                    'user_id'     => $credentials['user_id'],
                    'ip_address'  => $request->ip(),
                    'user_agent'  => $request->header('User-Agent', null),
                    'content_key'  => 'orders:log.create-api-successful',
                    'content_params'  => (object) ['order_id' => $insertOrder->id],
                ]);
                // $insertServiceProviderResponse = ServiceProviderResponse::create([
                //     'type'                => 'order_create',
                //     'status'              => 'success',
                //     'user_id'             => $credentials['user_id'],
                //     'order_id'            => $insertOrder->id,
                //     'service_id'          => $service->id,
                //     'service_provider_id' => $service->service_provider_id,
                //     'logs'                => ($service->serviceProvider->type === 'auto') ? $curl : (object) [],
                // ]);
                return response()->json([
                    'order' => $insertOrder->id,
                ], 200, [], JSON_PRETTY_PRINT);
                return redirect()->back()->with('responseSuccess', 'Pesanan berhasil dibuat.');
            } else {
                return response()->json([
                    'error' => 'Service not available'
                ], 422, [], JSON_PRETTY_PRINT);
            }
        }
    }

    public function statusOrder(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            OrderStatusValidator::rules($request)
        );
        if ($validator->fails()) {
            return response()->json([
                'error' => 'Incorrect Request'
            ], 400, [], JSON_PRETTY_PRINT);
        }
        $checkUser = $user = User::with('locale')->whereJsonContains('api->api_key', $request->input('key'))->first();

        $orderRefIDs = array_unique(array_filter(explode(',', str_replace(' ', '', escape_input($request->input('orders'))))));

        if (empty($orderRefIDs)) {
            return response()->json([
                'error' => 'Incorrect Request'
            ], 400, [], JSON_PRETTY_PRINT);
        }

        if (count($orderRefIDs) === 1) {
            $order = Order::with('service')
                ->where('user_id', $user->id)
                ->where(function ($query) use ($orderRefIDs) {
                    $query->whereIn('id', $orderRefIDs);
                })
                ->first();

            if (!$order) {
                return response()->json([
                    'error' => 'Incorrect order ID'
                ], 404, [], JSON_PRETTY_PRINT);
            }

            return response()->json([
                'charge' => round(
                    (float) $user->locale->usd_rate * $order->price,
                    (int) $user->locale->max_decimal_digits
                ),
                'start_count' => $order->start_count,
                'status' => $order->status,
                'remains' => $order->remains,
                'currency' => $user->locale->currency_code,
            ], 200, [], JSON_PRETTY_PRINT);
        }

        $orders = Order::with('service')
            ->where('user_id', $user->id)
            ->where(function ($query) use ($orderRefIDs) {
                $query->whereIn('id', $orderRefIDs);
            })
            ->get()
            ->mapWithKeys(function ($row) use ($user) {
                return [
                    $row->id => [
                        'charge' => round(
                            (float) $user->locale->usd_rate * $row->price,
                            (int) $user->locale->max_decimal_digits
                        ),
                        'start_count' => $row->start_count,
                        'status' => $row->status,
                        'remains' => $row->remains,
                        'currency' => $user->locale->currency_code,
                    ],
                ];
            });

        $data = collect($orderRefIDs)->mapWithKeys(function ($refId) use ($orders) {
            return [$refId => $orders[$refId] ?? $orders->firstWhere('id', $refId) ?? ['error' => 'Incorrect order ID']];
        });

        return response()->json(
            $data,
            200,
            [],
            JSON_PRETTY_PRINT
        );
    }

    public function createRefill(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            OrderRefillCreateValidator::rules($request)
        );
        if ($validator->fails()) {
            return response()->json([
                'error' => 'Incorrect Request'
            ], 400, [], JSON_PRETTY_PRINT);
        }
        $checkUser = $user = User::whereJsonContains('api->api_key', $request->input('key'))->first();
        $checkOrder = $target = Order::where('user_id', $user->id)->where('id', $request->input('order'))->first();
        if ($checkOrder->status <> 'completed') {
            return response()->json([
                'error' => 'Pesanan masih berstatus ' . $checkOrder->status . '.'
            ], 422, [], JSON_PRETTY_PRINT);
        }
        if ($target->service && $target->service->refill_days && Carbon::parse($target->created_at)->diffInDays(Carbon::now()) > $target->service->refill_days) {
            return response()->json([
                'error' => 'Layanan hanya mendukung isi ulang selama ' . $target->service->refill_days . ' hari sejak pesanan dibuat.'
            ], 422, [], JSON_PRETTY_PRINT);
        }
        if ($target->service && $target->service->refill_available_in_hours && Carbon::parse($target->created_at)->diffInHours(Carbon::now()) < $target->service->refill_available_in_hours) {
            return response()->json([
                'error' => 'isi ulang tersedia dalam ' . CarbonInterval::seconds(Carbon::now()->subHours($target->service->refill_available_in_hours)->diffInSeconds($target->created_at))->cascade()->forHumans()
            ], 422, [], JSON_PRETTY_PRINT);
        }
        $checkOrderRefillExists = $orderRefillExists = OrderRefill::where([
            'user_id' => $user->id,
            'order_id' => $target->id
        ])->latest()->first();
        if ($checkOrderRefillExists && $orderRefillExists->status == 'pending') {
            return response()->json([
                'error' => 'Isi ulang pesanan sedang dalam antrian.'
            ], 422, [], JSON_PRETTY_PRINT);
        }
        if ($checkOrderRefillExists && in_array($orderRefillExists->status, ['processing', 'in_progress'])) {
            return response()->json([
                'error' => 'Isi ulang pesanan sedang dalam proses, mohon tunggu proses selesai.'
            ], 422, [], JSON_PRETTY_PRINT);
        }
        if ($checkOrderRefillExists && $orderRefillExists->status == 'completed') {
            if (Carbon::parse($orderRefillExists->created_at)->diffInDays(Carbon::now()) < 1) {
                return response()->json([
                    'error' => 'coba lagi dalam ' . CarbonInterval::seconds(Carbon::now()->subHours(24)->diffInSeconds($orderRefillExists->created_at))->cascade()->forHumans()
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
                        'error' => 'Pesanan tidak dapat diisi ulang, silahkan coba lagi dalam beberapa saat.'
                    ], 422, [], JSON_PRETTY_PRINT);
                }
            } catch (Exception $error) {
                return response()->json([
                    'error' =>    'Terjadi Kesalahan.'
                ], 500, [], JSON_PRETTY_PRINT);
            }
            if ($orderRefillRespons == false) {
                return response()->json([
                    'error' => 'Pesanan tidak dapat diisi ulang, silahkan coba lagi dalam beberapa saat.'
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
                        'refill' => $insertOrderRefill->id,
                    ], 200, [], JSON_PRETTY_PRINT);
                } else {
                    return response()->json([
                        'error' => 'Terjadi Kesalahan.'
                    ], 500, [], JSON_PRETTY_PRINT);
                }
            }
        } else {
            return response()->json([
                'error' =>  'Pesanan tidak dapat diisi ulang.'
            ], 422, [], JSON_PRETTY_PRINT);
        }
    }

    public function statusRefill(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            OrderRefillStatusValidator::rules($request)
        );
        if ($validator->fails()) {
            return response()->json([
                'error' => 'Incorrect Request'
            ], 400, [], JSON_PRETTY_PRINT);
        }
        $checkUser = $user = User::whereJsonContains('api->api_key', $request->input('key'))->first();

        $orderRefill = OrderRefill::where('user_id', $user->id)
            ->where(function ($query) use ($request) {
                $query->where('id', $request->input('refill'));
            })
            ->first();

        if (!$orderRefill) {
            return response()->json([
                'error' => $request->input('id') . ' tidak ditemukan'
            ], 404, [], JSON_PRETTY_PRINT);
        }

        return response()->json([
            'status'          => $orderRefill->status,
        ], 200, [], JSON_PRETTY_PRINT);
    }

    public function orderCancelCreate(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            OrderCancelCreateValidator::rules($request)
        );
        if ($validator->fails()) {
            return response()->json([
                'error' => 'Incorrect Request'
            ], 400, [], JSON_PRETTY_PRINT);
        }
        $checkUser = $user = User::whereJsonContains('api->api_key', $request->input('key'))->first();
        $checkOrder = $target = Order::where('user_id', $user->id)->where('id', $request->input('order'))->first();
        if ($target->service && Carbon::parse($target->created_at)->diffInHours(Carbon::now()) < 1) {
            return response()->json([
                'error' => 'pembatalan tersedia dalam ' . CarbonInterval::seconds(Carbon::now()->subHours(1)->diffInSeconds($target->created_at))->cascade()->forHumans()
            ], 422, [], JSON_PRETTY_PRINT);
        }
        $checkOrderCancelExists = $orderCancelExists = OrderCancel::where([
            'user_id' => $user->id,
            'order_id' => $target->id
        ])->latest()->first();
        if ($checkOrderCancelExists) {
            if (Carbon::parse($orderCancelExists->created_at)->diffInHours(Carbon::now()) < 1) {
                return response()->json([
                    'error' => 'Coba lagi dalam ' . CarbonInterval::seconds(Carbon::now()->subHours(1)->diffInSeconds($orderCancelExists->created_at))->cascade()->forHumans()
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
                        'error' => 'Pesanan tidak dapat dibatalkan, silahkan coba lagi dalam beberapa saat.'
                    ], 422, [], JSON_PRETTY_PRINT);
                }
            } catch (Exception $error) {
                return response()->json([
                    'error' => 'Terjadi Kesalahan.'
                ], 500, [], JSON_PRETTY_PRINT);
            }
            if ($orderCancelResponse == false) {
                return response()->json([
                    'error' => 'Pesanan tidak dapat dibatalkan, silahkan coba lagi dalam beberapa saat.'
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
                        'order' => $insertOrderCancel->id
                    ], 200, [], JSON_PRETTY_PRINT);
                } else {
                    return response()->json([
                        'error' => 'Terjadi Kesalahan.'
                    ], 500, [], JSON_PRETTY_PRINT);
                }
            }
        } else {
            return response()->json([
                'error' => 'Pesanan tidak dapat dibatalkan.'
            ], 422, [], JSON_PRETTY_PRINT);
        }
    }
}

class OrderCreateValidator
{
    public static function rules(Request $request): array
    {
        $service = Service::find($request->input('service'));

        $rules = [
            'service' => ['required', 'exists:services,id'],
            'link' => ['required', 'string'],
            'quantity' => [
                'required',
                'numeric',
                'integer',
            ],
        ];

        if ($service && !is_null($service->min)) {
            $rules['quantity'][] = 'min:' . $service->min;
        }

        if ($service && !is_null($service->max)) {
            $rules['quantity'][] = 'max:' . $service->max;
        }

        if (
            $service &&
            in_array($service->type, [
                'custom_comments',
                'custom_comments_package',
                'comment_replies',
            ])
        ) {
            $rules['comments'] = ['required', 'string'];
        }

        if (
            $service &&
            in_array($service->type, [
                'mentions_custom_list',
                'mentions_with_hashtags',
            ])
        ) {
            $rules['usernames'] = ['required', 'string'];
        }

        if (
            $service &&
            in_array($service->type, [
                'mentions_user_followers',
                'comment_likes',
                'comment_replies',
            ])
        ) {
            $rules['username'] = ['required', 'string'];
        }

        if ($service && $service->type === 'mentions_with_hashtags') {
            $rules['hashtags'] = ['required', 'string'];
        }

        if ($service && $service->type === 'mentions_hashtag') {
            $rules['hashtag'] = ['required', 'string'];
        }

        if ($service && $service->type === 'mentions_media_likers') {
            $rules['media_url'] = ['required', 'string', 'url'];
        }

        if ($service && $service->type === 'poll') {
            $rules['answer_number'] = [
                'required',
                'numeric',
                'integer',
            ];
        }

        return $rules;
    }
}

class OrderStatusValidator
{
    public static function rules(Request $request): array
    {
        return [
            'orders' => [
                'required',
                'string',
                new MultipleOrderRefIDV2()
            ],
        ];
    }
}

class OrderRefillCreateValidator
{
    public static function rules(Request $request): array
    {
        return [
            'order' => [
                'required',
                'string',
            ],
        ];
    }
}

class OrderRefillStatusValidator
{
    public static function rules(Request $request): array
    {
        return [
            'refill' => [
                'required',
                'string',
            ],
        ];
    }
}

class OrderCancelCreateValidator
{
    public static function rules(Request $request): array
    {
        return [
            'order' => [
                'required',
                'string',
            ],
        ];
    }
}

class MultipleOrderRefIDV2 implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (count(explode(',', str_replace(' ', '', escape_input($value)))) > 100) {
            $fail('- ID. Ref pesanan tidak boleh lebih dari 100.');
        }
        $checkUser = $user = User::whereJsonContains('api->api_key', request()->input('key'))->first();
        $checkOrders = $orders = Order::where('user_id', $user->id)
            ->where(function ($query) use ($value) {
                $query->whereIn('id', explode(',', str_replace(' ', '', escape_input($value))));
            })
            ->get()->map(function ($row) {
                return [
                    'value'   => $row->id,
                ];
            });
        if ($checkOrders->isEmpty()) {
            $fail('- tidak ada pesanan ditemukan');
        }
    }
}

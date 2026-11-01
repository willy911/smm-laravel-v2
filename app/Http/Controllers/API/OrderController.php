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

use App\Http\Requests\Order\CreateRequest;
use App\Http\Requests\Order\StatusOldestRequest;
use App\Http\Requests\Order\StatusRequest;
use App\Http\Requests\Profile\PostRequest;
use App\Models\Deposit\Deposit;
use App\Models\Order\Order;
use App\Models\Service\Service;
use App\Models\Service\ServiceCustomPrice;
use App\Models\Service\ServiceProviderResponse;
use App\Models\User\User;
use App\Models\User\UserActivityLog;
use App\Models\User\UserBalanceLog;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\Controller;
use App\Models\Locale;
use Illuminate\Foundation\Http\FormRequest;

class OrderController extends Controller
{
    public function create(CreateRequest $request)
    {
        $checkUser = $user = User::whereJsonContains('api->api_key', $request->input('api_key'))
            ->whereJsonContains('api->secret_key', $request->input('secret_key'))
            ->first();
        $localeId = Locale::find(1);

        $credentials = [
            'user_id'             => $user->id,
            'service_provider_id' => 0,
            'service_id'          => escape_input($request->input('service_id')),
            'target'              => escape_input($request->input('target')),
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
                'status' => false,
                'message' => 'Transaction Failed',
                'errors' => [
                    'Layanan tidak tersedia'
                ]
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
        //         'status' => false,
        //         'message' => 'Transaction Failed',
        //         'errors' => [
        //             'Layanan tidak tersedia.'
        //         ]
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
                'status' => false,
                'message' => 'Transaction Failed',
                'errors' => [
                    'Layanan tidak tersedia.'
                ]
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
                    'status' => true,
                    'data'   => [
                        'id' => $insertOrder->id,
                        'service_id' => $credentials['service_id'],
                        'service_name' => $credentials['service_name'],
                        'target' => $credentials['target'],
                        'quantity' => $credentials['quantity'],
                        'price' => round(
                            (float) $credentials['price'] * $localeId->usd_rate,
                            (int) $localeId->max_decimal_digits
                        ),
                        'status' => 'pending',
                        'start_count' => 0,
                        'remains' => $credentials['quantity'],
                        'initial_balance' => $credentials['initial_balance'],
                        'final_balance' => $credentials['final_balance'],
                        'created_at' => $insertOrder->created_at,
                        'updated_at' => $insertOrder->updated_at,
                    ],
                ], 200, [], JSON_PRETTY_PRINT);
                return redirect()->back()->with('responseSuccess', 'Pesanan berhasil dibuat.');
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Transaction Failed',
                    'errors' => [
                        'Terjadi Kesalahan.'
                    ]
                ], 500, [], JSON_PRETTY_PRINT);
            }
        }
    }

    public function status(StatusRequest $request)
    {
        $checkUser = $user = User::whereJsonContains('api->api_key', $request->input('api_key'))
            ->whereJsonContains('api->secret_key', $request->input('secret_key'))
            ->first();
        $localeId = Locale::find(1);

        $orderRefIDs = array_unique(array_filter(explode(',', str_replace(' ', '', escape_input($request->input('id'))))));

        if (empty($orderRefIDs)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid Payload',
                'errors' => [
                    'id tidak valid'
                ]
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
                    'status' => false,
                    'message' => 'pesanan tidak ditemukan',
                    'errors' => [
                        implode(', ', $orderRefIDs) . ' tidak ditemukan'
                    ]
                ], 404, [], JSON_PRETTY_PRINT);
            }

            return response()->json([
                'status' => true,
                'data'   => [
                    'success'         => 'pesanan ditemukan',
                    'id'          => $order->id,
                    'service_id'      => $order->service->id ?? null,
                    'service_name'    => $order->service_name,
                    'target'          => $order->target,
                    'quantity'        => $order->quantity,
                    'price' => round(
                        (float) $order->price * $localeId->usd_rate,
                        (int) $localeId->max_decimal_digits
                    ),
                    'status'          => $order->status,
                    'start_count'     => $order->start_count,
                    'remains'         => $order->remains,
                    'initial_balance' => $order->initial_balance,
                    'final_balance'   => $order->final_balance,
                    'created_at'      => $order->created_at->format('Y-m-d H:i:s'),
                    'updated_at'      => $order->updated_at->format('Y-m-d H:i:s'),
                ],
            ], 200, [], JSON_PRETTY_PRINT);
        }

        $orders = Order::with('service')
            ->where('user_id', $user->id)
            ->where(function ($query) use ($orderRefIDs) {
                $query->whereIn('id', $orderRefIDs);
            })
            ->get()
            ->mapWithKeys(function ($row) use ($localeId) {
                return [
                    $row->id => [
                        'success'         => 'pesanan ditemukan',
                        'id'          => $row->id,
                        'service_id'      => $row->service->id ?? null,
                        'service_name'    => $row->service_name,
                        'target'          => $row->target,
                        'quantity'        => $row->quantity,
                        'price' => round(
                            (float) $row->price * $localeId->usd_rate,
                            (int) $localeId->max_decimal_digits
                        ),
                        'status'          => $row->status,
                        'start_count'     => $row->start_count,
                        'remains'         => $row->remains,
                        'initial_balance' => $row->initial_balance,
                        'final_balance'   => $row->final_balance,
                        'created_at'      => $row->created_at->format('Y-m-d H:i:s'),
                        'updated_at'      => $row->updated_at->format('Y-m-d H:i:s'),
                    ],
                    $row->id => [
                        'success'         => 'pesanan ditemukan',
                        'id'          => $row->id,
                        'service_id'      => $row->service->id ?? null,
                        'service_name'    => $row->service_name,
                        'target'          => $row->target,
                        'quantity'        => $row->quantity,
                        'price'           => $row->price,
                        'status'          => $row->status,
                        'start_count'     => $row->start_count,
                        'remains'         => $row->remains,
                        'initial_balance' => $row->initial_balance,
                        'final_balance'   => $row->final_balance,
                        'created_at'      => $row->created_at->format('Y-m-d H:i:s'),
                        'updated_at'      => $row->updated_at->format('Y-m-d H:i:s'),
                    ],
                ];
            });

        $data = collect($orderRefIDs)->mapWithKeys(function ($refId) use ($orders) {
            return [$refId => $orders[$refId] ?? $orders->firstWhere('id', $refId) ?? ['error' => 'pesanan tidak ditemukan']];
        });

        return response()->json([
            'status' => true,
            'data'   => $data,
        ], 200, [], JSON_PRETTY_PRINT);
    }
}

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

namespace App\Http\Controllers\User\Order;

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
use App\Services\User\OrderService;
use App\Tables\User\Order as OrderTable;
use App\Enums\Order\Order as OrderEnum;
use App\Jobs\SendApiOrderRequest;
use App\Models\Website\WebsiteSitemap;
use App\Rules\MassOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\Mailer\Transport\SendmailTransportFactory;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        if ($request->has('page')) {
            $orderService = new OrderService($request);
            $tableItems = $orderService->getTableItems();
            $summary = $orderService->getSummary();
            return response()->json([
                'status' => true,
                'data' => $tableItems,
                'summary' => $summary,
            ]);
        }
        return inertia('user/order/index', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'services' => Service::whereHas('orders', function ($query) {
                        $query->where('user_id', auth()->id());
                    })->withCount([
                        'orders' => function ($query) {
                            $query->where('user_id', auth()->id());
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

    public function create(Service $target)
    {
        return inertia('user/order/create', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'serviceCategoryGroups' => ServiceCategoryGroup::whereHas('serviceCategories.services', function ($query) {
                        $query->where('status', '1');
                    })
                        ->orderBy('name', 'asc')
                        ->get()
                        ->map(function ($group) {
                            return $group;
                        }),
                    'target'                => $target,
                    'tos'                   => WebsiteSitemap::where('slug', 'tos')->first(),
                ]
            )
        ]);
    }

    public function store(OrderRequest $request)
    {
        if ($request->input('order.type') == 'single') $this->processOrderSingle($request);
        if ($request->input('order.type') == 'mass') $this->processOrderMass($request);
    }

    public function show(Order $target)
    {
        abort_if($target->user_id <> Auth::id(), 403);
        return inertia('User/Order/Detail', [
            'pageProps' => [
                'target'         => $target->makeVisible('is_refunded'),
            ]
        ]);
    }

    public function report(Request $request)
    {
        if ($request->has('from')) {
            $tableItemsQuery = Order::query()->where('user_id', auth()->id());
            if ($request->filled(['from', 'to'])) {
                $tableItemsQuery->whereBetween(DB::raw('DATE(created_at)'), [
                    date('Y-m-d', strtotime($request->input('from'))),
                    date('Y-m-d', strtotime($request->input('to')))
                ]);
            } elseif ($request->filled('from')) {
                $tableItemsQuery->whereDate(
                    'created_at',
                    date('Y-m-d', strtotime($request->input('from')))
                );
            }

            $tableItems = $tableItemsQuery->orderBy('id', 'desc')->limit(500)->get([
                'id',
                'service_name',
                'target',
                'quantity',
                'price',
                'profit',
                'status',
                'created_at',
            ]);
            $summary = [
                'total' => [
                    'count' => $tableItems->count(),
                    'price' => $tableItems->sum('price'),
                ],
                'pending' => [
                    'count' => $tableItems->where('status', 'pending')->count(),
                    'price' => $tableItems->where('status', 'pending')->sum('price'),
                ],
                'processing' => [
                    'count' => $tableItems->whereIn('status', ['processing', 'in_progress'])->count(),
                    'price' => $tableItems->whereIn('status', ['processing', 'in_progress'])->sum('price'),
                ],
                'completed' => [
                    'count' => $tableItems->where('status', 'completed')->count(),
                    'price' => $tableItems->where('status', 'completed')->sum('price'),
                ],
                'failed' => [
                    'count' => $tableItems->whereIn('status', ['partial', 'error', 'canceled'])->count(),
                    'price' => $tableItems->whereIn('status', ['partial', 'error', 'canceled'])->sum('price'),
                ],
            ];

            return response()->json([
                'status' => true,
                'pageProps' => [
                    'summary' => $summary,
                    'rows' => $tableItems,
                ],
            ]);
        }

        return inertia('user/order/report', [
            'pageProps' => [
                'summary' => [
                    'total' => ['count' => 0, 'price' => 0],
                    'pending' => ['count' => 0, 'price' => 0],
                    'processing' => ['count' => 0, 'price' => 0],
                    'completed' => ['count' => 0, 'price' => 0],
                    'failed' => ['count' => 0, 'price' => 0],
                ],
                'rows' => [],
            ],
        ]);
    }

    protected function processOrderSingle($request)
    {
        $checkUser = $user = User::find(Auth::id());
        if (RateLimiter::tooManyAttempts('order-create:' . $user->id, $perMinute = 1)) {
            $seconds = RateLimiter::availableIn('order-create:' . $user->id);
            return redirect()->back()->with('responseError', __('common.toast.throttle', ['seconds' => $seconds]));
        }
        RateLimiter::hit('order-create:' . $user->id);
        $credentials = [
            'user_id'             => $user->id,
            'service_provider_id' => 0,
            'service_id'          => escape_input($request->input('service.id')),
            'target'              => escape_input($request->input('order.target')),
            'quantity'            => $request->input('order.quantity'),
            'ip_address'          => $request->ip(),
            'user_agent'          => $request->header('User-Agent'),
            'initial_balance'     => $user->balance,
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
            RateLimiter::clear('order-create:' . $user->id);
            return redirect()->back()->with('responseError', __('orders.toast.service_not_available'));
        }
        // $countOrder = $order = Order::where([
        //     ['target', $credentials['target']],
        //     ['status', 'pending'],
        // ])->count();
        // if ($countOrder >= 1) {
        //     RateLimiter::clear('order-create:' . $user->id);
        //     return redirect()->back()->with('responseError', __('orders.toast.wait_previous_order'));
        // }
        if ($service->type == 'custom_comments') {
            $comments = array_filter(explode("\n", $request->input('order.comments')), 'trim');
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
                    'usernames' => escape_input(implode("\n", array_filter(explode("\n", $request->input('order.usernames')), 'trim'))),
                    'hashtags'  => escape_input(implode("\n", array_filter(explode("\n", $request->input('order.hashtags')), 'trim'))),
                ],
            ];
        }
        if ($service->type == 'mentions_custom_list') {
            $usernames = array_filter(explode("\n", $request->input('order.usernames')), 'trim');
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
                    'hashtag' => $request->input('order.hashtag'),
                ],
            ];
        }
        if (in_array($service->type, ['mentions_user_followers', 'comment_likes'])) {
            $credentials['additional_input'] = (object) [
                'label' => $service->type,
                'value' => (object) [
                    'username' => $request->input('order.username'),
                ],
            ];
        }
        if ($service->type == 'mentions_media_likers') {
            $credentials['additional_input'] = (object) [
                'label' => 'mentions_media_likers',
                'value' => (object) [
                    'media_url' => $request->input('order.media_url'),
                ],
            ];
        }
        if ($service->type == 'custom_comments_package') {
            $comments = array_filter(explode("\n", $request->input('order.comments')), 'trim');
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
                    'answer_number' => $request->input('order.answer_number'),
                ],
            ];
        }
        if ($service->type == 'comment_replies') {
            $comments = array_filter(explode("\n", $request->input('order.comments')), 'trim');
            $credentials['quantity'] = count($comments);
            $credentials['additional_input'] = (object) [
                'label' => 'comment_replies',
                'value' => (object) [
                    'username' => $request->input('order.username'),
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
        if (auth()->user()->service_discount > 0) {
            $credentials['price'] -= (
                $credentials['price'] *
                (auth()->user()->service_discount / 100)
            );
            $credentials['profit'] -= (
                $credentials['profit'] *
                (auth()->user()->service_discount / 100)
            );
        }
        $credentials['final_balance'] = $credentials['initial_balance'] - $credentials['price'];
        if ($credentials['quantity'] < $service->min) {
            RateLimiter::clear('order-create:' . $user->id);
            return redirect()->back()->with('responseError', __('orders.toast.min_quantity', ['min' => format_amount($service->min)]));
        }
        if ($credentials['quantity'] > $service->max) {
            RateLimiter::clear('order-create:' . $user->id);
            return redirect()->back()->with('responseError', __('orders.toast.max_quantity', ['max' => format_amount($service->max)]));
        }
        if ($user->balance < $credentials['price']) {
            RateLimiter::clear('order-create:' . $user->id);
            return redirect()->back()->with('responseError', __('orders.toast.insufficient_balance'));
        }
        try {
            DB::beginTransaction();

            $orderResponse = false;

            $additionalInput = $credentials['additional_input'] ?? [];

            if (is_string($additionalInput)) {
                $additionalInput = json_decode($additionalInput, true);
            } elseif (is_object($additionalInput)) {
                $additionalInput = json_decode(json_encode($additionalInput), true);
            }

            if ($service->serviceProvider->type === 'manual') {
                $orderResponse = true;

                $credentials['service_provider_order_id'] = 1;
            } else {
                $serviceProviderConfig = optional(
                    $service->serviceProvider
                        ->serviceProviderConfiguration
                        ->order_create_configuration
                );

                $formData = collect($serviceProviderConfig->params)
                    ->mapWithKeys(function ($param) use (
                        $service,
                        $credentials,
                        $additionalInput
                    ) {
                        if ($param->type === 'custom') {
                            return [
                                $param->key => $param->value,
                            ];
                        }

                        if ($param->type === 'default_parameter') {
                            return [
                                $param->key => collect(
                                    $service->serviceProvider->default_parameters
                                )
                                    ->pluck('value', 'key')
                                    ->get($param->key),
                            ];
                        }

                        return [
                            $param->key => strtr($param->type, [
                                'service_id'           => $service->service_provider_service_id,
                                'order_target'         => $credentials['target'],
                                'order_quantity'       => $credentials['quantity'],
                                'order_comments'       => $additionalInput['value']['comments'] ?? null,
                                'order_usernames'      => $additionalInput['value']['usernames'] ?? null,
                                'order_username'       => $additionalInput['value']['username'] ?? null,
                                'order_hashtags'       => $additionalInput['value']['hashtags'] ?? null,
                                'order_hashtag'        => $additionalInput['value']['hashtag'] ?? null,
                                'order_media_url'      => $additionalInput['value']['media_url'] ?? null,
                                'order_answer_number'  => $additionalInput['value']['answer_number'] ?? null,
                            ]),
                        ];
                    })
                    ->toArray();

                $response = Http::withoutVerifying()
                    ->timeout(300)
                    ->send(
                        $serviceProviderConfig->method,
                        $serviceProviderConfig->endpoint,
                        [
                            'form_params' => $formData,
                        ]
                    );

                if ($response->ok()) {
                    $serviceProviderOrderId = data_get(
                        $response->object(),
                        $serviceProviderConfig->parse_response->order_id
                    );

                    if ($serviceProviderOrderId) {
                        $orderResponse = true;
                        $credentials['service_provider_order_id'] = $serviceProviderOrderId;
                        $credentials['service_provider_order_log'] = $response->json();
                    }
                }
            }

            if (!$orderResponse) {
                RateLimiter::clear('order-create:' . $user->id);
                return redirect()
                    ->back()
                    ->with('responseError', __('orders.toast.service_not_available'));
            }

            $credentials['is_sent'] = 1;

            $insertOrder = Order::create($credentials);

            $user->update([
                'balance' => $credentials['final_balance'],
            ]);

            UserBalanceLog::create([
                'user_id'         => $credentials['user_id'],
                'type'            => 'debit',
                'category'        => 'order',
                'amount'          => $credentials['price'],
                'initial_balance' => $credentials['initial_balance'],
                'final_balance'   => $credentials['final_balance'],
                'content_key'     => 'orders:log.create-single-successful',
                'content_params'  => (object) [
                    'order_id' => $insertOrder->id,
                ],
            ]);

            UserActivityLog::create([
                'user_id'        => $credentials['user_id'],
                'ip_address'     => $request->ip(),
                'user_agent'     => $request->userAgent(),
                'content_key'    => 'orders:log.create-single-successful',
                'content_params' => (object) [
                    'order_id' => $insertOrder->id,
                ],
            ]);

            DB::commit();

            RateLimiter::clear('order-create:' . $user->id);

            (new OrderService($request))
                ->invalidateUserOrdersCache($user->id);
            return redirect()
                ->back()
                ->with('responseSuccess', __('orders.toast.order_created'))
                ->with('orderData', [
                    'id'           => $insertOrder->id,
                    'service_name' => $insertOrder->service_name,
                    'target'       => $insertOrder->target,
                    'quantity'     => $insertOrder->quantity,
                ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            RateLimiter::clear('order-create:' . $user->id);
            report($e);
            return redirect()
                ->back()
                ->with('responseError', __('orders.toast.service_not_available'));
        }
    }

    protected function processOrderMass($request)
    {
        $checkUser = $user = User::find(Auth::id());
        if (RateLimiter::tooManyAttempts('order-create:' . $user->id, $perMinute = 1)) {
            $seconds = RateLimiter::availableIn('order-create:' . $user->id);
            return redirect()->back()->with('responseError', __('common.toast.throttle', ['seconds' => $seconds]));
        }
        RateLimiter::hit('order-create:' . $user->id);
        $checkService = $service = Service::with(['serviceProvider' => function ($query) {
            $query->where('status', '1');
        }])->where([
            ['id', $request->input('service.id')],
            ['status', '1'],
        ])->where('id', $request->input('service.id'))->where('status', '1')->first();
        if (!$checkService) {
            RateLimiter::clear('order-create:' . $user->id);
            return redirect()->back()->with('responseError', __('orders.toast.service_not_available'));
        }
        if ($service->type <> 'primary') {
            RateLimiter::clear('order-create:' . $user->id);
            return redirect()->back()->with('responseError', __('orders.toast.mass_order_not_supported'));
        }
        $checkCustomPrice = $customPrice = ServiceCustomPrice::where([
            ['user_group_id', $user->user_group_id],
            ['service_id', $request->input('service.id')]
        ])->first();
        $calculatePrice = function ($quantity) use (
            $service,
            $customPrice,
            $user
        ) {
            $price = $service->price / 1000 * $quantity;
            $profit = $service->profit / 1000 * $quantity;
            if ($customPrice) {
                $price = (
                    $customPrice->price_configs->price / 1000
                ) * $quantity;
                $profit = (
                    $customPrice->price_configs->profit / 1000
                ) * $quantity;
            }
            if ($user->service_discount > 0) {
                $discountMultiplier = (
                    1 - ($user->service_discount / 100)
                );
                $price *= $discountMultiplier;

                $profit *= $discountMultiplier;
            }
            return [
                'price' => $price,
                'profit' => $profit,
            ];
        };
        $targets = collect(explode("\n", $request->input('order.mass')))
            ->filter(fn($line) => trim($line) !== '')
            ->map(fn($line) => explode(',', $line)[0]);
        $existingOrders = Order::whereIn('target', $targets)
            ->where('status', 'pending')
            ->pluck('target');
        $totalPrice = 0;
        foreach (
            array_filter(
                explode("\n", $request->input('order.mass')),
                'trim'
            ) as $line
        ) {
            $item = explode(',', $line);
            $pricing = $calculatePrice($item[1]);
            $totalPrice += $pricing['price'];
        }
        if ($user->balance < $totalPrice) {
            RateLimiter::clear('order-create:' . $user->id);
            return redirect()->back()->with('responseError', __('orders.toast.insufficient_balance'));
        }
        $messages = [];
        foreach (array_filter(explode("\n", $request->input('order.mass')), 'trim') as $line) {
            $item = explode(',', $line);
            $credentials = [
                'user_id'             => $user->id,
                'service_provider_id' => 0,
                'service_id'          => escape_input($request->input('service.id')),
                'target'              => $item[0],
                'quantity'            => $item[1],
                'ip_address'          => $request->ip(),
                'user_agent'          => $request->header('User-Agent'),
                'initial_balance'     => $user->balance,
            ];
            $credentials['service_provider_id'] = $service->service_provider_id;
            $credentials['service_name'] = $service->name;
            $credentials['remains'] = $credentials['quantity'];
            $pricing = $calculatePrice(
                $credentials['quantity']
            );
            $credentials['price'] = $pricing['price'];
            $credentials['profit'] = $pricing['profit'];
            $credentials['final_balance'] = $credentials['initial_balance'] - $credentials['price'];
            // if ($existingOrders->contains($credentials['target'])) {
            //     $messages[] = [
            //         'type'  => 'fail',
            //         'label' => 'orders:toast.wait-previous-order'
            //     ];
            //     continue;
            // }
            if ($credentials['quantity'] < $service->min) {
                // RateLimiter::clear('order-create:' . $user->id);
                $messages[] = [
                    'type'  => 'fail',
                    'label' => 'orders:toast.min-quantity',
                    'data' => [
                        'min' => format_amount($service->min)
                    ]
                ];
                continue;
            }
            if ($credentials['quantity'] > $service->max) {
                // RateLimiter::clear('order-create:' . $user->id);
                $messages[] = [
                    'type'  => 'fail',
                    'label' => 'orders:toast.max-quantity',
                    'data' => [
                        'max' => format_amount($service->max)
                    ]
                ];
                continue;
            }
            if ($user->balance < $credentials['price']) {
                // RateLimiter::clear('order-create:' . $user->id);
                $messages[] = [
                    'type'  => 'fail',
                    'label' => 'orders:toast.insufficient-balance'
                ];
                continue;
            }
            $orderResponse = true;
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
            //     $messages[] = [
            //         'type'  => 'fail',
            //         'label' => __('orders.toast.service_not_available')
            //     ];
            //     continue;
            // }
            if ($service->serviceProvider->type == 'manual') {
                $credentials['service_provider_order_id'] = 1;
            }
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
                    'content_key'  => 'orders:log.create-mass-successful',
                    'content_params'  => (object) ['order_id' => $insertOrder->id],
                ]);
                $insertActivityLog = UserActivityLog::create([
                    'user_id'     => $credentials['user_id'],
                    'ip_address'  => $request->ip(),
                    'user_agent'  => $request->header('User-Agent'),
                    'content_key'  => 'orders:log.create-mass-successful',
                    'content_params'  => (object) ['order_id' => $insertOrder->id],
                ]);
                // if ($service->serviceProvider->type == 'auto') {
                //     SendApiOrderRequest::dispatch($insertOrder, $credentials);
                // }
                $messages[] = [
                    'type'  => 'success',
                    'label' => 'orders:toast.order-created-with-target',
                    'data' => [
                        'order_id' => $insertOrder->id,
                        'order_target' => $credentials['target'],
                    ]
                ];
            } else {
                // RateLimiter::clear('order-create:' . $user->id);
                $messages[] = [
                    'type'  => 'fail',
                    'label' => 'common:toast.exception'
                ];
            }
        }
        RateLimiter::clear('order-create:' . $user->id);
        $orderService = new OrderService($request);
        $orderService->invalidateUserOrdersCache(auth('web')->id());
        return redirect()->back()->with('responseSuccess', __('orders.toast.order_created'))->with('orderDataMassal', [
            'service_name' => $service->name,
            'rows'         => count($messages),
            'orders'       => $messages
        ]);
    }
}

class OrderRequest extends FormRequest
{
    public function rules(Request $request)
    {
        $checkService = $service = Service::find($request->input('service.id'));
        return [
            'service.category.id' => ['required', 'exists:service_categories,id'],
            'service.id'          => ['required', 'exists:services,id'],
            'order.target'        => ($request->input('order.type') == 'single') ? ['required', 'string'] : [],
            'order.quantity'      => ($request->input('order.type') == 'single') ? [
                'required',
                'numeric',
                'integer',
                ($checkService && !is_null($service->min)) ? 'min:' . $service->min : '',
                ($checkService && !is_null($service->max)) ? 'max:' . $service->max : '',
            ] : [],
            'order.mass'          => ($request->input('order.type') == 'mass') ? ['required', 'string', new MassOrder()] : [],
            'order.comments'      => (($checkService && in_array($service->type, ['custom_comments', 'custom_comments_package', 'comment_replies'])) && ($request->input('order.type') == 'single')) ? ['required', 'string'] : [],
            'order.usernames'     => (($checkService && in_array($service->type, ['mentions_custom_list', 'mentions_with_hashtags'])) && ($request->input('order.type') == 'single')) ? ['required', 'string'] : [],
            'order.username'      => (($checkService && in_array($service->type, ['mentions_user_followers', 'comment_likes', 'comment_replies'])) && ($request->input('order.type') == 'single')) ? ['required', 'string'] : [],
            'order.hashtags'      => (($checkService && $service->type == 'mentions_with_hashtags') && ($request->input('order.type') == 'single')) ? ['required', 'string'] : [],
            'order.hashtag'       => (($checkService && $service->type == 'mentions_hashtag') && ($request->input('order.type') == 'single')) ? ['required', 'string'] : [],
            'order.media_url'     => (($checkService && $service->type == 'mentions_media_likers') && ($request->input('order.type') == 'single')) ? ['required', 'string', 'url'] : [],
            'order.answer_number' => (($checkService && $service->type == 'poll') && ($request->input('order.type') == 'single')) ? ['required', 'numeric', 'integer'] : [],
        ];
    }

    public function attributes()
    {
        return [
            'service.category.id' => __('common.labels.category'),
            'service.id'          => __('common.labels.service'),
            'order.target'        => __('common.labels.target'),
            'order.quantity'      => __('common.labels.quantity'),
            'order.mass'          => __('common.labels.target') . ',' . __('common.labels.quantity'),
            'order.comments'      => __('common.labels.comments'),
            'order.usernames'     => __('common.labels.usernames'),
            'order.username'      => __('common.labels.username'),
            'order.hashtags'      => __('common.labels.hashtags'),
            'order.hashtag'       => __('common.labels.hashtag'),
            'order.media_url'     => __('common.labels.media_url'),
            'order.answer_number' => __('common.labels.answer_number'),
        ];
    }
}

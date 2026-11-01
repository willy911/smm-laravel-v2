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

namespace App\Http\Controllers\Admin\Service;

use Exception;
use Inertia\Inertia;
use App\Models\Admin\Admin;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Models\Service\Service;
use App\Models\Service\ServiceType;
use App\Models\Service\ServiceCategory;
use App\Services\Admin\Service\TypeService;
use App\Services\General\Service\CategoryService;
use App\Services\Admin\Service\IconLibraryService;
use App\Services\General\Service\ServiceService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Storage;
use App\Enums\Service\Service as ServiceEnum;
use App\Models\Service\ServiceCustomPrice;
use App\Models\Service\ServiceProvider;
use App\Models\Service\ServiceUpdate;
use App\Models\User\UserGroup;
use App\Services\Admin\Service\ProviderService;
use Illuminate\Support\Facades\Http;
use stdClass;

class CustomPriceController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update']),
        ];
    }

    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.custom_price.access'), 403);
        if ($request->has('page')) {
            $tableItems = ServiceCustomPrice::withTrashed()->with(['service', 'userGroup'])->when($request->input(), function ($query) use ($request) {
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
                if ($request->filled('filter.deleted_at.start') && $request->filled('filter.deleted_at.end')) {
                    $query->whereDate('deleted_at', '>=', date('Y-m-d', strtotime($request->input('filter.deleted_at.start'))));
                    $query->whereDate('deleted_at', '<=', date('Y-m-d', strtotime($request->input('filter.deleted_at.end'))));
                } elseif ($request->filled('filter.deleted_at.start') && !$request->filled('filter.deleted_at.end')) {
                    $query->whereDate('deleted_at', date('Y-m-d', strtotime($request->input('filter.deleted_at.start'))));
                }
                if ($request->filled('filter.service_id')) {
                    $query->whereIn('service_id', explode(',', $request->input('filter.service_id')));
                }
                if ($request->filled('filter.user_group_id')) {
                    $query->whereIn('user_group_id', explode(',', $request->input('filter.user_group_id')));
                }
                if ($request->input('filter.search')) {
                    $query->whereAny([
                        'id',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                $item->service?->makeVisible(['original_price']);
                $item->setHidden([]);
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('admin/service/custom-price/index', [
            'pageProps' => Inertia::defer(
                function () {
                    return [
                        'userGroups' => [
                            'options' => UserGroup::latest()->get()->map(function ($row) {
                                return [
                                    'value'   => $row->id,
                                    'label'   => $row->name,
                                ];
                            })->toArray(),
                            'filters' => UserGroup::has('serviceCustomPrices')->withCount(['serviceCustomPrices'])->latest()->get()->map(function ($row) {
                                return [
                                    'value'   => $row->id,
                                    'label'   => $row->name,
                                    'count'   => $row->service_custom_prices_count,
                                ];
                            })->toArray(),
                        ],
                        'services' => [
                            'filters' => Service::has('serviceCustomPrices')->withCount(['serviceCustomPrices'])->latest()->get()->map(function ($row) {
                                return [
                                    'value'   => $row->id,
                                    'label'   => $row->name,
                                    'count'   => $row->service_custom_prices_count,
                                ];
                            })->toArray(),
                        ],
                    ];
                }
            )
        ]);
    }

    public function store(CustomPriceRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.custom_price.create'), 403);
        $credentials = [
            'user_group_id'       => escape_input($request->input('user.group.id')),
            'service_id'          => escape_input($request->input('service.id')),
            'service_category_id' => escape_input($request->input('service.category.id')),
            'price_configs'            => $request->input('service.price_configs'),
        ];
        $insertData = ServiceCustomPrice::create($credentials);
        $insertActivityLog =  AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.create-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.custom-price',
                'id' => $insertData->id,
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.create_successful', [
                'item' => __('common.labels.custom_price'),
                'id' => $insertData->id,
            ]),
        ]);
    }

    public function update(ServiceCustomPrice $target, CustomPriceRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.custom_price.update'), 403);
        $credentials = [
            'user_group_id'       => escape_input($request->input('user.group.id')),
            'service_id'          => escape_input($request->input('service.id')),
            'service_category_id' => escape_input($request->input('service.category.id')),
            'price_configs'            => $request->input('service.price_configs'),
        ];
        $updateData = $target->update($credentials);
        if ($target->wasChanged()) {
            $insertActivityLog = AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content_key'  => 'admin/common:log.update-successful',
                'content_params'  => (object) [
                    'item' => 'common:labels.custom-price',
                    'id' => $target->id,
                ],
                'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
            ]);
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.update_successful', [
                'item' => __('common.labels.custom_price'),
                'id' => $target->id,
            ]),
        ]);
    }

    public function action($action, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.custom_price.delete'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        if ($action === 'trash') $targets = ServiceCustomPrice::whereIn('id', $ids)->withoutTrashed()->get();
        if (in_array($action, ['restore', 'destroy'])) {
            $targets = ServiceCustomPrice::whereIn('id', $ids)->onlyTrashed()->get();
        }
        if ($targets->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => __('common.empty.no_data_found'),
            ], 404);
        }
        foreach ($targets as $target) {
            try {
                switch ($action) {
                    case 'trash':
                        if ($target->delete()) {
                            AdminActivityLog::create([
                                'admin_id'   => auth('admin')->user()->id,
                                'ip_address' => request()->ip(),
                                'user_agent' => request()->header('User-Agent'),
                                'content_key'  => 'admin/common:log.trash-successful',
                                'content_params'  => (object) [
                                    'item' => 'common:labels.custom-price',
                                    'id' => $target->id,
                                ],
                            ]);
                        }
                        break;
                    case 'restore':
                        if ($target->trashed() && $target->restore()) {
                            AdminActivityLog::create([
                                'admin_id'   => auth('admin')->user()->id,
                                'ip_address' => request()->ip(),
                                'user_agent' => request()->header('User-Agent'),
                                'content_key'  => 'admin/common:log.restore-successful',
                                'content_params'  => (object) [
                                    'item' => 'common:labels.custom-price',
                                    'id' => $target->id,
                                ],
                            ]);
                        }
                        break;
                    case 'destroy':
                        if ($target->delete() && $target->forceDelete()) {
                            AdminActivityLog::create([
                                'admin_id'   => auth('admin')->user()->id,
                                'ip_address' => request()->ip(),
                                'user_agent' => request()->header('User-Agent'),
                                'content_key'  => 'admin/common:log.destroy-successful',
                                'content_params'  => (object) [
                                    'item' => 'common:labels.custom-price',
                                    'id' => $target->id,
                                ],
                            ]);
                        }
                        break;
                    default:
                        break;
                }
            } catch (Exception $e) {
                return response()->json([
                    'status'  => false,
                    'message' => __('common.toast.exception')
                ], 500);
            }
        }
        return response()->json([
            'status'  => true,
            'message' => __("admin/common.toast.{$action}_successful", [
                'item' => __('common.labels.custom_price'),
                'id' => implode(', ', $ids),
            ]),
        ]);
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.custom_price.update'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        $targets = ServiceCustomPrice::whereIn('id', $ids)->get();
        if ($targets->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => __('common.empty.no_data_found'),
            ], 404);
        }
        foreach ($targets as $target) {
            if ($columnName == 'status') {
                $columnNameLabel = 'status';
                $from = $target->status;
            }
            if ($columnName == 'user_group_id') {
                $columnNameLabel = 'group';
                $from = $target->user_group_id;
            }
            if ($from != $columnValue) {
                $target->update([$columnName => $columnValue]);
                AdminActivityLog::create([
                    'admin_id'   => auth('admin')->user()->id,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->header('User-Agent'),
                    'content_key'  => 'admin/common:log.switch-successful',
                    'content_params'  => (object) [
                        'item' => 'common:labels.custom-price',
                        'id' => $target->id,
                        'column' => 'common:labels.' . $columnNameLabel . '',
                        'from' => $from,
                        'to' => $columnValue,
                    ],
                ]);
            }
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.switch_successful', [
                'item' => __('common.labels.custom_price'),
                'id' => implode(', ', $ids),
                'column' => __('common.labels.' . $columnNameLabel . ''),
            ]),
        ]);
    }

    public function options(Request $request, ServiceService $serviceService)
    {
        $items = collect($serviceService->getOptions());
        if ($items->isNotEmpty()) {
            return response()->json([
                'status' => true,
                'items'  => $items->values(),
            ]);
        }
        return response()->json([
            'status'  => false,
            'message' => __('common.empty.no_data_found')
        ], 404);
    }

    public function sort(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.custom_price.update'), 403);
        foreach ($request->input('items') as $index => $item) {
            Service::whereId($item['value'])->update([
                'sort_number' => $index + 1
            ]);
        }
        $insertActivityLog = AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.sort-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.service',
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.sort_successful', [
                'item' => __('common.labels.service'),
            ]),
        ]);
    }

    public function fetch(Request $request)
    {
        // abort_if(!auth('admin')->user()->roles->service->access || !auth('admin')->user()->roles->service->create, 404);
        if (!$request->input('service.provider.id')) return response()->json([
            'status'  => false,
            'message' => 'Please fill in all required fields.',
        ], 400);
        $serviceProvider = ServiceProvider::with(['locale', 'serviceProviderConfiguration'])->where([
            ['id', $request->input('service.provider.id')],
            ['type', 'auto'],
            ['status', '1']
        ])->first();
        if (!$serviceProvider) return response()->json([
            'status'  => false,
            'message' => 'Provider not found.',
        ], 400);
        if ($request->input('type') === 'by-id' && !preg_match('/^\s*\d+(\s*,\s*\d+)*\s*$/', $request->input('service.id'))) return response()->json([
            'status'  => false,
            'message' => 'Invalid IDs.',
        ], 400);
        $serviceCategories = ServiceCategory::pluck('name', 'id')->toArray();
        try {
            $serviceProviderConfig = optional($serviceProvider->serviceProviderConfiguration->services_configuration);
            $formData = collect($serviceProviderConfig->params)->mapWithKeys(function ($param) use ($serviceProvider) {
                if ($param->type === 'custom') {
                    return [$param->key => $param->value];
                }
                if ($param->type === 'default_parameter') {
                    return [
                        $param->key => collect($serviceProvider->default_parameters)
                            ->pluck('value', 'key')
                            ->get($param->key)
                    ];
                }
                return [];
            })->toArray();
            $curl = Http::asForm()->withoutVerifying()->send(
                $serviceProviderConfig->method,
                $serviceProviderConfig->endpoint,
                ['form_params' => $formData]
            );
            $services = [];
            $response = false;
            $rate = $serviceProvider->locale->usd_rate;
            if ($curl->successful()) {
                $services = data_get($curl->object(), $serviceProviderConfig->parse_response->looping, []);
                if (is_array($services) && array_filter($services, fn($item) => is_object($item))) {
                    $response = true;
                    $filteredServices = [];
                    $credentials = [];
                    $requestedIds = array_map('trim', explode(',', $request->input('service.id', '')));
                    foreach ($services as $service) {
                        $serviceId = data_get($service, $serviceProviderConfig->parse_response->id);
                        $category = strtr(data_get($service, $serviceProviderConfig->parse_response->category), []);
                        $name = data_get($service, $serviceProviderConfig->parse_response->name);
                        $price = data_get($service, $serviceProviderConfig->parse_response->price) / $rate;
                        $profitSettings = $serviceProviderConfig->profit_configs;
                        $profit = $profitSettings->type === 'fixed'
                            ? $profitSettings->value
                            : ($profitSettings->value / 100) * $price;
                        $min = data_get($service, $serviceProviderConfig->parse_response->min);
                        $max = data_get($service, $serviceProviderConfig->parse_response->max);
                        $description = $serviceProviderConfig->parse_response->description
                            ? data_get($service, $serviceProviderConfig->parse_response->description)
                            : '';
                        $type = $serviceProviderConfig->parse_response->type
                            ? data_get($service, $serviceProviderConfig->parse_response->type)
                            : 'primary';
                        $isRefillSupport = $serviceProviderConfig->parse_response->is_refill_support
                            ? data_get($service, $serviceProviderConfig->parse_response->is_refill_support)
                            : '0';
                        $isCancelSupport = $serviceProviderConfig->parse_response->is_cancel_support
                            ? data_get($service, $serviceProviderConfig->parse_response->is_cancel_support)
                            : '0';
                        $refillDays = $serviceProviderConfig->parse_response->refill_days
                            ? data_get($service, $serviceProviderConfig->parse_response->refill_days)
                            : '30';
                        $refillAvailableInHours = $serviceProviderConfig->parse_response->refill_available_in_hours
                            ? data_get($service, $serviceProviderConfig->parse_response->refill_available_in_hours)
                            : '24';
                        $shouldInclude = $request->input('type') === 'by-id'
                            ? in_array($serviceId, $requestedIds)
                            : true;
                        if ($shouldInclude) {
                            $parseTexts = collect($serviceProviderConfig->parse_text->name);
                            $parseTexts->each(function ($item) use (&$category, &$name, &$description) {
                                $category = str_replace($item->from, $item->to, $category);
                                $name = str_replace($item->from, $item->to, $name);
                                $description = str_replace($item->from, $item->to, $description);
                            });
                            if ($type !== 'primary') {
                                $types = get_object_vars($serviceProviderConfig->parse_text->type ?? new stdClass());
                                $lowerTypes = array_map('strtolower', $types);
                                $key = array_search(strtolower($type), $lowerTypes, true);
                                // $validTypes = ServiceEnum::getValue('ARRAY_TYPE_KEYS');
                                if ($key !== false) {
                                    $type = $key;
                                } else {
                                    continue;
                                }
                            }
                            if ($request->boolean('service.is_fetch_with_category')) {
                                $serviceCategoryID = array_search($category, $serviceCategories) ?? null;
                                if (!$serviceCategoryID) {
                                    $insertProductCategory = ServiceCategory::create([
                                        'name' => $category,
                                        'slug' => Str::slug($category),
                                    ]);
                                    $serviceCategoryID = $insertProductCategory->id;
                                    $serviceCategories[$serviceCategoryID] = $insertProductCategory->name;
                                }
                            }
                            $filteredServices[] = [
                                'id' => $serviceId,
                                'category' => $category,
                                'name' => $name,
                                'original_price' => $price,
                                'price' => $price + $profit,
                                'profit' => $profit,
                            ];
                            $credentials[] = [
                                'service_provider_id' => $serviceProvider->id,
                                'service_provider_service_id' => $serviceId,
                                'service_category_id' => $request->boolean('service.is_fetch_with_category') ? $serviceCategoryID : null,
                                'name' => $name,
                                'original_price' => $price,
                                'price' => $price + $profit,
                                'profit' => $profit,
                                'min' => $min,
                                'max' => $max,
                                'description' => $description,
                                'type' => $type,
                                'is_refill_support' => filter_var($isRefillSupport, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
                                'is_cancel_support' => filter_var($isCancelSupport, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
                                'refill_days' => $refillDays,
                                'refill_available_in_hours' => $refillAvailableInHours,
                                'is_auto_update_price' => '1'
                            ];
                        }
                    }
                    $existingServices = Service::whereIn('service_provider_id', array_column($credentials, 'service_provider_id'))
                        ->whereIn('service_provider_service_id', array_column($credentials, 'service_provider_service_id'))
                        ->get(['service_provider_id', 'service_provider_service_id'])
                        ->map(function ($service) {
                            return $service['service_provider_id'] . '|' . $service['service_provider_service_id'];
                        })->toArray();

                    $seenInBatch = [];
                    $filteredCredentials = collect($credentials)->filter(function ($credential) use ($existingServices, &$seenInBatch) {
                        $currentCombination = $credential['service_provider_id'] . '|' . $credential['service_provider_service_id'];

                        if (in_array($currentCombination, $existingServices)) {
                            return false;
                        }

                        if (in_array($currentCombination, $seenInBatch)) {
                            return false;
                        }

                        $seenInBatch[] = $currentCombination;
                        return true;
                    })->all();
                    if (!empty($filteredCredentials)) {
                        foreach ($filteredCredentials as $filteredCredential) {
                            // info($filteredCredential);
                            $insertService = Service::create($filteredCredential);
                        }
                    }
                    $services = $filteredServices;
                }
            }
            if (!$response) {
                return response()->json([
                    'status' => false,
                    'message' => $response->json()
                ], 400);
            }
        } catch (Exception $error) {
            return response()->json([
                'status' => false,
                'message' => $error->getMessage()
            ], 500);
        }
        return response()->json([
            'status'   => true,
            'message' => 'Service retrieved successfully.',
            'services' => $services
        ]);
    }
}

class CustomPriceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('service.custom_price.access')
                && $admin->hasRole('service.custom_price.update');
        }

        return $admin->hasRole('service.custom_price.access')
            && $admin->hasRole('service.custom_price.create');
    }

    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        return [
            'user.group.id'       => ['required', 'exists:user_groups,id'],
            'service.category.id' => ['required', 'exists:service_categories,id'],
            'service.id'          => ['required', 'exists:services,id', Rule::unique('service_custom_prices', 'service_id')->where('user_group_id', $request->input('user.group.id'))->ignore($id)],
            'service.price_configs.original_price' => [
                'required',
                'numeric',
                'min:0',
            ],
            'service.price_configs.price' => [
                'required',
                // 'numeric',
                // 'min:0',
                // 'gte:service.price_configs.original_price',
                // 'lt:service.price_configs.sell_price',
            ],
            'service.price_configs.profit' => [
                'required',
                'numeric',
                'min:0',
            ],
        ];
    }

    public function attributes()
    {
        return [
            'user.group.id'       =>  __('common.labels.group'),
            'service.category.id'         => __('common.labels.category'),
            'service.id'          => __('common.labels.service'),
            'service.price_configs.original_price' => __('admin/common.labels.original_price'),
            'service.price_configs.price' => __('admin/common.labels.sell_price'),
            'service.price_configs.profit' => __('admin/common.labels.profit_value'),
        ];
    }
}

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
use App\Jobs\Service\UpsertProviderServiceJob;
use App\Jobs\Service\SyncServicesFromProviderJob;
use App\Services\Admin\Service\TypeService;
use App\Services\General\Service\CategoryService;
use App\Services\Admin\Service\IconLibraryService;
use App\Services\General\Service\ProviderServicesFetcher;
use App\Services\General\Service\ServiceService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Storage;
use App\Enums\Service\Service as ServiceEnum;
use App\Models\Service\ServiceProvider;
use App\Models\Service\ServiceUpdate;
use App\Rules\UpdateBatchService;
use App\Services\Admin\Service\ProviderService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use stdClass;

class ServiceController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update', 'updateBatchDescription']),
        ];
    }

    public function index(Request $request, CategoryService $categoryService, ProviderService $providerService)
    {
        abort_unless(auth('admin')->user()->hasRole('service.access'), 403);
        if ($request->has('page')) {
            $tableItems = Service::withTrashed()->with(['serviceCategory', 'serviceProvider'])->when($request->input(), function ($query) use ($request) {
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
                if ($request->filled('filter.service_category_id')) {
                    $query->whereIn('service_category_id', explode(',', $request->input('filter.service_category_id')));
                }
                if ($request->filled('filter.service_provider_id')) {
                    $query->whereIn('service_provider_id', explode(',', $request->input('filter.service_provider_id')));
                }
                if ($request->filled('filter.type')) {
                    $query->whereIn('type', explode(',', $request->input('filter.type')));
                }
                if ($request->filled('filter.other')) {
                    $filters = array_map('trim', explode(',', $request->input('filter.other')));
                    foreach ($filters as $filter) {
                        match ($filter) {
                            'custom_price' => auth()->check() ?
                                $query->whereHas('serviceCustomPrices', fn($q) => $q->where('user_group_id', auth()->user()->user_group_id)) : null,
                            'favorite' => auth()->check() ?
                                $query->whereHas('serviceFavorites', fn($q) => $q->where('user_id', auth()->id())) : null,
                            'recommended' => $query->where('is_recommended', '1'),
                            'best_seller' => $query->where('is_best_seller', '1'),
                            'refill' => $query->where('is_refill_support', '1'),
                            'cancel' => $query->where('is_cancel_support', '1'),
                            default => null,
                        };
                    }
                }
                if ($request->filled('filter.status')) {
                    $query->whereIn('status', explode(',', $request->input('filter.status')));
                }
                if ($request->input('filter.search')) {
                    $query->whereAny([
                        'id',
                        'name',
                        'service_provider_service_id',
                        'description',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                $item->setHidden([]);
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('admin/service/index', [
            'pageProps' => Inertia::defer(
                function () use ($categoryService, $providerService) {
                    $othersCounts = Service::selectRaw('
                        COUNT(*) as total,
                        COUNT(IF(is_recommended = 1, 1, NULL)) as recommended_count,
                        COUNT(IF(is_best_seller = 1, 1, NULL)) as best_seller_count,
                        COUNT(IF(is_refill_support = 1, 1, NULL)) as refill_count,
                        COUNT(IF(is_cancel_support = 1, 1, NULL)) as cancel_count
                    ')->where('status', '1')->first();
                    return [
                        'serviceProviders' => [
                            'options' => $providerService->getOptions(),
                            'filters' => $providerService->getFilters(),
                        ],
                        'serviceCategories' => [
                            'options' => $categoryService->getOptions(),
                            'filters' => $categoryService->getFilters(),
                        ],
                        'serviceTypes' => [
                            'options' => collect(ServiceEnum::ARRAY_TYPE_LABELS())->map(function ($label, $value) {
                                $data[] = ['value' => (string) $value, 'label' => $label];
                                return $data;
                            })->collapse(),
                            'filters' => Service::where('status', '1')
                                ->selectRaw('type, COUNT(*) as count')
                                ->groupBy('type')
                                ->get()
                                ->map(function ($row) {
                                    $label = ServiceEnum::getValue('ARRAY_TYPE_LABELS')[$row->type] ?? null;
                                    if ($label === null) {
                                        return null;
                                    }
                                    return [
                                        'value' => $row->type,
                                        'label' => $label,
                                        'count' => $row->count,
                                    ];
                                })->filter()->values(),
                        ],
                        'others' => array_values(array_filter([
                            [
                                'value' => 'recommended',
                                'label' => 'common:labels.recommended',
                                'count' => $othersCounts->recommended_count
                            ],
                            [
                                'value' => 'best_seller',
                                'label' => 'common:labels.best-seller',
                                'count' => $othersCounts->best_seller_count
                            ],
                            [
                                'value' => 'refill',
                                'label' => 'common:labels.refill',
                                'count' => $othersCounts->refill_count
                            ],
                            [
                                'value' => 'cancel',
                                'label' => 'common:labels.cancel',
                                'count' => $othersCounts->cancel_count
                            ],
                        ]))
                    ];
                }
            )
        ]);
    }

    public function store(ServiceRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.create'), 403);
        $credentials = [
            'type'                        => $request->input('service.type'),
            'service_category_id'         => $request->input('service.category.id'),
            'service_provider_id'         => $request->input('service.provider.id'),
            'service_provider_service_id' => $request->input('service.provider.service_id'),
            'name'                        => $request->input('service.name'),
            'min'                         => $request->input('service.min'),
            'max'                         => $request->input('service.max'),
            'original_price'              => $request->input('service.price_configs.original_price'),
            'price'                       => $request->input('service.price_configs.price'),
            'profit'                      => $request->input('service.price_configs.profit'),
            'description'                 => $request->input('service.description'),
            'is_refill_support'           => $request->boolean('service.other_configs.is_refill_support'),
            'is_cancel_support'           => $request->boolean('service.other_configs.is_cancel_support'),
            'is_auto_update_price'        => $request->boolean('service.other_configs.is_auto_update_price'),
            'is_manual_profit'            => $request->boolean('service.other_configs.is_manual_profit'),
            'refill_days'                 => $request->input('service.other_configs.refill_days') ?: 30,
            'refill_available_in_hours'   => $request->input('service.other_configs.refill_available_in_hours') ?: 1,
        ];
        $insertData = Service::create($credentials);
        ServiceUpdate::create([
            'service_id'      => $insertData->id,
            'type'            => 'added',
            'content_key'     => 'services:updates.description.added',
            'content_params'  => (object) [],
        ]);
        $insertActivityLog =  AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.create-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.service',
                'id' => $insertData->id,
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.create_successful', [
                'item' => __('common.labels.service'),
                'id' => $insertData->id,
            ]),
        ]);
    }

    public function show(Service $target)
    {
        abort_unless(auth('admin')->user()->hasRole('service.access'), 403);
        return response()->json([
            'status'  => true,
            'service' => $target->makeVisible(['original_price'])
        ]);
    }

    public function update(Service $target, ServiceRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.update'), 403);
        $credentials = [
            'type'                        => $request->input('service.type'),
            'service_category_id'         => $request->input('service.category.id'),
            'service_provider_id'         => $request->input('service.provider.id'),
            'service_provider_service_id' => $request->input('service.provider.service_id'),
            'name'                        => $request->input('service.name'),
            'min'                         => $request->input('service.min'),
            'max'                         => $request->input('service.max'),
            'original_price'              => $request->input('service.price_configs.original_price'),
            'price'                       => $request->input('service.price_configs.price'),
            'profit'                      => $request->input('service.price_configs.profit'),
            'description'                 => $request->input('service.description'),
            'is_refill_support'           => $request->boolean('service.other_configs.is_refill_support'),
            'is_cancel_support'           => $request->boolean('service.other_configs.is_cancel_support'),
            'is_auto_update_price'        => $request->boolean('service.other_configs.is_auto_update_price'),
            'is_manual_profit'            => $request->boolean('service.other_configs.is_manual_profit'),
            'refill_days'                 => $request->input('service.other_configs.refill_days'),
            'refill_available_in_hours'   => $request->input('service.other_configs.refill_available_in_hours'),
        ];
        if ($target->price < $credentials['price']) {
            $insertServiceUpdate = ServiceUpdate::create([
                'service_id'     => $target->id,
                'type'           => 'price_increased',
                'content_key'    => 'services:updates.description.price-increased',
                'content_params' => (object) [
                    'from' => $target->price,
                    'to'   => $credentials['price'],
                    'type' => 'currency'
                ],
            ]);
        }
        if ($target->price > $credentials['price']) {
            $insertServiceUpdate = ServiceUpdate::create([
                'service_id'     => $target->id,
                'type'           => 'price_decreased',
                'content_key'    => 'services:updates.description.price-decreased',
                'content_params' => (object) [
                    'from' => $target->price,
                    'to'   => $credentials['price'],
                    'type' => 'currency'
                ],
            ]);
        }
        if ($target->min <> $credentials['min']) {
            $insertServiceUpdate = ServiceUpdate::create([
                'service_id'     => $target->id,
                'type'           => 'updated',
                'content_key'    => 'services:updates.description.min-updated',
                'content_params' => (object) [
                    'from' => $target->min,
                    'to'   => $credentials['min'],
                    'type' => 'amount'
                ],
            ]);
        }
        if ($target->max <> $credentials['max']) {
            $insertServiceUpdate = ServiceUpdate::create([
                'service_id'  => $target->id,
                'type'        => 'updated',
                'content_key'     => 'services:updates.description.max-updated',
                'content_params'  => (object) [
                    'from' => $target->max,
                    'to'   => $credentials['max'],
                    'type' => 'amount'
                ],
            ]);
        }
        $updateData = $target->update($credentials);
        if ($target->wasChanged()) {
            $insertActivityLog = AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content_key'  => 'admin/common:log.update-successful',
                'content_params'  => (object) [
                    'item' => 'common:labels.service',
                    'id' => $target->id,
                ],
                'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
            ]);
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.update_successful', [
                'item' => __('common.labels.service'),
                'id' => $target->id,
            ]),
        ]);
    }

    public function action($action, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.delete'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        if ($action === 'trash') $targets = Service::whereIn('id', $ids)->withoutTrashed()->get();
        if (in_array($action, ['restore', 'destroy'])) {
            $targets = Service::whereIn('id', $ids)->onlyTrashed()->get();
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
                            $insertServiceUpdate = ServiceUpdate::create([
                                'service_id'     => $target->id,
                                'type'           => 'deleted',
                                'content_key'    => 'services:updates.description.deleted',
                                'content_params' => (object) [],
                            ]);
                            AdminActivityLog::create([
                                'admin_id'   => auth('admin')->user()->id,
                                'ip_address' => request()->ip(),
                                'user_agent' => request()->header('User-Agent'),
                                'content_key'  => 'admin/common:log.trash-successful',
                                'content_params'  => (object) [
                                    'item' => 'common:labels.service',
                                    'id' => $target->id,
                                ],
                            ]);
                        }
                        break;
                    case 'restore':
                        if ($target->trashed() && $target->restore()) {
                            $insertServiceUpdate = ServiceUpdate::create([
                                'service_id'     => $target->id,
                                'type'           => 'enabled',
                                'content_key'    => 'services:updates.description.enabled',
                                'content_params' => (object) [],
                            ]);
                            AdminActivityLog::create([
                                'admin_id'   => auth('admin')->user()->id,
                                'ip_address' => request()->ip(),
                                'user_agent' => request()->header('User-Agent'),
                                'content_key'  => 'admin/common:log.restore-successful',
                                'content_params'  => (object) [
                                    'item' => 'common:labels.service',
                                    'id' => $target->id,
                                ],
                            ]);
                        }
                        break;
                    case 'destroy':
                        if ($target->delete() && $target->forceDelete()) {
                            $insertServiceUpdate = ServiceUpdate::create([
                                'service_id'     => $target->id,
                                'type'           => 'deleted',
                                'content_key'    => 'services:updates.description.deleted',
                                'content_params' => (object) [],
                            ]);
                            AdminActivityLog::create([
                                'admin_id'   => auth('admin')->user()->id,
                                'ip_address' => request()->ip(),
                                'user_agent' => request()->header('User-Agent'),
                                'content_key'  => 'admin/common:log.destroy-successful',
                                'content_params'  => (object) [
                                    'item' => 'common:labels.service',
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
                'item' => __('common.labels.service'),
                'id' => implode(', ', $ids),
            ]),
        ]);
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.update'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        $targets = Service::whereIn('id', $ids)->get();
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
            if ($columnName == 'is_recommended') {
                $columnNameLabel = 'recommended';
                $from = $target->is_recommended;
            }
            if ($columnName == 'is_best_seller') {
                $columnNameLabel = 'best_seller';
                $from = $target->is_best_seller;
            }
            if ($from != $columnValue) {
                if ($columnNameLabel == 'status') {
                    $insertServiceUpdate = ServiceUpdate::create([
                        'service_id'     => $target->id,
                        'type'           => $columnValue == '1' ? 'enabled' : 'disabled',
                        'content_key'    => $columnValue == '1' ? 'services:updates.description.enabled' : 'services:updates.description.disabled',
                        'content_params' => (object) [],
                    ]);
                }
                $target->update([$columnName => $columnValue]);
                AdminActivityLog::create([
                    'admin_id'   => auth('admin')->user()->id,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->header('User-Agent'),
                    'content_key'  => 'admin/common:log.switch-successful',
                    'content_params'  => (object) [
                        'item' => 'common:labels.service',
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
                'item' => __('common.labels.service'),
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
        abort_unless(auth('admin')->user()->hasRole('service.update'), 403);
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
        abort_unless(auth('admin')->user()->hasRole('service.create'), 403);
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
            $curl = Http::timeout(300)->asForm()->withoutVerifying()->send(
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
                    $maps = $serviceProviderConfig->parse_text->name;
                    $search  = collect($maps)->pluck('from')->toArray();
                    $replace = collect($maps)->pluck('to')->toArray();
                    foreach ($services as $service) {
                        $serviceId = data_get($service, $serviceProviderConfig->parse_response->id);
                        $category = strtr(data_get($service, $serviceProviderConfig->parse_response->category), []);
                        $name = data_get($service, $serviceProviderConfig->parse_response->name);
                        $name = str_replace($search, $replace, $name);
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
                            $description = app(ProviderServicesFetcher::class)->normalizeDescription($description);
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
                                        'name'           => $category,
                                        'slug'           => Str::slug($category),
                                        'profit_configs' => $serviceProviderConfig->profit_configs,
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
                            ServiceUpdate::create([
                                'service_id'      => $insertService->id,
                                'type'            => 'added',
                                'content_key'     => 'services:updates.description.added',
                                'content_params'  => (object) [],
                            ]);
                        }
                    }
                    $services = $filteredServices;
                }
            }
            if (!$response) {
                return response()->json([
                    'status' => false,
                    'message' => $curl->json()
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

    /**
     * Sync manual layanan dari semua provider type=auto (tombol Sync Services).
     * Menjalankan rantai yang sama dengan cron service:sync-service, tetapi INLINE
     * (tanpa queue worker): fetch HTTP -> upsert service_provider_services ->
     * finalize (hapus layanan provider yang tiada) -> sync ke tabel services.
     */
    public function syncProviderServices(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.update'), 403);

        $providers = \App\Models\Service\ServiceProvider::query()
            ->whereHas('serviceProviderConfiguration')
            ->where('type', 'auto')
            ->where('status', '1')
            ->with(['serviceProviderConfiguration', 'locale'])
            ->get();

        if ($providers->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.service_sync_no_provider'),
            ], 400);
        }

        set_time_limit(0);
        $results = [];
        $totalUpserted = 0;
        $allOk = true;

        foreach ($providers as $serviceProvider) {
            $result = [
                'provider' => $serviceProvider->name,
                'ok'       => false,
                'fetched'  => 0,
            ];

            try {
                $fetchResult = app(ProviderServicesFetcher::class)
                    ->fetch($serviceProvider);

                if (!$fetchResult['ok'] || empty($fetchResult['services'])) {
                    $results[] = $result + ['error' => $fetchResult['error'] ?? 'Fetch gagal'];
                    $allOk = false;
                    continue;
                }

                $mappedServices = $fetchResult['services'];

                $result['fetched'] = count($mappedServices);

                // 1) Upsert ke service_provider_services (logika UpsertProviderServiceJob, inline)
                $upsertJob = new UpsertProviderServiceJob($serviceProvider->id, $mappedServices);
                $upsertJob->handle();

                // 2) Finalize: hapus layanan provider yang sudah tiada di respons + sync services (logika FinalizeProviderServiceSyncJob, inline)
                $incomingServiceIds = collect($mappedServices)->pluck('service_provider_service_id')->unique()->values()->toArray();
                \App\Models\Service\ServiceProviderService::where('service_provider_id', $serviceProvider->id)
                    ->whereNotIn('service_provider_service_id', $incomingServiceIds)
                    ->delete();
                $syncJob = new SyncServicesFromProviderJob($serviceProvider->id);
                $syncJob->handle();

                $result['ok'] = true;
                $totalUpserted += $result['fetched'];
                $results[] = $result;
            } catch (Exception $e) {
                $results[] = $result + ['error' => $e->getMessage()];
                $allOk = false;
            }
        }

        // Ringkasan perubahan services dari service_updates yang baru dibuat sync job
        $recentUpdates = \App\Models\Service\ServiceUpdate::query()
            ->where('created_at', '>=', now()->subSeconds(60))
            ->whereIn('type', ['disabled', 'enabled', 'price_increased', 'price_decreased'])
            ->get(['type']);

        $summary = [
            'fetched' => $totalUpserted,
            'disabled' => $recentUpdates->where('type', 'disabled')->count(),
            'enabled'  => $recentUpdates->where('type', 'enabled')->count(),
            'price_changed' => $recentUpdates->whereIn('type', ['price_increased', 'price_decreased'])->count(),
        ];

        return response()->json([
            'status'  => $allOk,
            'message' => $allOk
                ? __('admin/common.toast.service_sync_successful')
                : __('admin/common.toast.service_sync_partial'),
            'providers' => $results,
            'summary'   => $summary,
        ]);
    }

    /**
     * Sync manual deskripsi layanan dari satu provider (tombol Sync Deskripsi).
     * Mengambil deskripsi dari sumber provider (scrape bulk -> endpoint per-service
     * -> API provider) via ProviderServicesFetcher::descriptionsForIds(), memperbarui
     * service_provider_services lalu menyebarluaskannya ke tabel services dengan log ServiceUpdate.
     */
    public function syncProviderDescriptions(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.update'), 403);

        $request->validate(['provider_id' => ['required', 'integer']]);

        try {
            $provider = ServiceProvider::query()
                ->whereHas('serviceProviderConfiguration')
                ->where('type', 'auto')
                ->where('status', '1')
                ->with(['serviceProviderConfiguration', 'locale'])
                ->find($request->input('provider_id'));

            if (!$provider) {
                return response()->json([
                    'status'  => false,
                    'message' => __('admin/common.toast.description_sync_unsupported'),
                ], 400);
            }

            $config = optional($provider->serviceProviderConfiguration->services_configuration);

            $hasScrape   = !empty($config->descriptions_scrape->enabled);
            $hasEndpoint = !empty($config->descriptions_endpoint->enabled);
            $hasApiDesc  = !empty($config->parse_response->description);

            if (!$hasScrape && !$hasEndpoint && !$hasApiDesc) {
                return response()->json([
                    'status'  => false,
                    'message' => __('admin/common.toast.description_sync_unsupported'),
                ], 400);
            }

            $rows = \App\Models\Service\ServiceProviderService::where('service_provider_id', $provider->id)
                ->get(['id', 'service_provider_service_id', 'description']);

            if ($rows->isEmpty()) {
                return response()->json([
                    'status'  => false,
                    'message' => __('admin/common.toast.description_sync_no_provider'),
                ], 400);
            }

            set_time_limit(0);

            $descriptions = app(ProviderServicesFetcher::class)
                ->descriptionsForIds($provider, $rows->pluck('service_provider_service_id')->all());

            if (empty($descriptions)) {
                return response()->json([
                    'status'  => false,
                    'message' => __('admin/common.toast.description_sync_failed'),
                ], 400);
            }

            // 1) Update service_provider_services yang deskripsinya berubah (chunk 200).
            $providerUpdated = 0;

            foreach ($rows->chunk(200) as $rowChunk) {
                foreach ($rowChunk as $row) {
                    $newDescription = $descriptions[$row->service_provider_service_id] ?? null;

                    if ($newDescription === null
                        || trim((string) $newDescription) === ''
                        || trim((string) $row->description) === trim($newDescription)
                    ) {
                        continue;
                    }

                    $row->update(['description' => $newDescription]);
                    $providerUpdated++;
                }
            }

            // 2) Sebarluaskan ke tabel services (chunk 200) + log ServiceUpdate (pola SyncServicesFromProviderJob).
            $servicesUpdated = 0;

            Service::query()
                ->where('service_provider_id', $provider->id)
                ->whereIn('service_provider_service_id', array_keys($descriptions))
                ->select(['id', 'service_provider_service_id', 'description'])
                ->chunkById(200, function ($services) use ($descriptions, &$servicesUpdated) {
                    foreach ($services as $service) {
                        $newDescription = $descriptions[$service->service_provider_service_id] ?? null;

                        if ($newDescription === null
                            || trim((string) $service->description) === trim($newDescription)
                        ) {
                            continue;
                        }

                        $service->update(['description' => $newDescription]);

                        ServiceUpdate::create([
                            'service_id'     => $service->id,
                            'type'           => 'updated',
                            'content_key'    => 'services:updates.description.description-updated',
                            'content_params' => (object) [],
                        ]);

                        $servicesUpdated++;
                    }
                });

            return response()->json([
                'status'  => true,
                'message' => __('admin/common.toast.description_sync_successful'),
                'summary' => [
                    'scraped'          => count($descriptions),
                    'provider_updated' => $providerUpdated,
                    'services_updated' => $servicesUpdated,
                ],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateBatchCategory(ServiceCategoryUpdateRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.update'), 403);
        $validated = $request->validated();
        $ids = [];
        DB::transaction(function () use ($validated, $request, &$ids) {
            foreach ($validated['service']['ids'] as $index => $serviceId) {
                $service = Service::find($serviceId);
                $service->update([
                    'service_category_id' => $request->input('service.category.id'),
                ]);
                $ids[] = $service->id;
            }
        });

        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.update_successful', [
                'item' => __('common.labels.services'),
                'id'   => implode(', ', $ids),
            ]),
        ]);
    }

    public function updateBatchDescription(ServiceDescriptionUpdateRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.update'), 403);
        $validated = $request->validated();
        $ids = [];
        DB::transaction(function () use ($validated, &$ids) {
            foreach ($validated['services'] as $item) {
                $service = Service::findOrFail($item['id']);
                $service->update([
                    'description' => $item['description'] ?? $service->description,
                ]);
                $ids[] = $service->id;
            }
        });

        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.update_successful', [
                'item' => __('common.labels.services'),
                'id'   => implode(', ', $ids),
            ]),
        ]);
    }
}

class ServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('service.access')
                && $admin->hasRole('service.update');
        }

        return $admin->hasRole('service.access')
            && $admin->hasRole('service.create');
    }

    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        return [
            'service.type'                => ['required'],
            'service.category.id'         => ['required', 'exists:service_categories,id'],
            'service.provider.id'         => ['required', 'exists:service_providers,id'],
            'service.provider.service_id' => ['required'],
            'service.name'                => ['required'],
            'service.price_configs.original_price' => [
                'required',
                'numeric',
                'min:0',
            ],
            'service.price_configs.price' => [
                'required',
                'numeric',
                'min:0',
                'gte:service.price_configs.original_price',
            ],
            'service.price_configs.profit' => [
                'required',
                'numeric',
                'min:0',
            ],
            'service.min'               => ['required', 'numeric', 'integer', 'min:0', 'lte:service.max'],
            'service.max'               => ['required', 'numeric', 'integer', 'min:0', 'gte:service.min'],
            'service.description'       => ['required'],
            'service.other_configs.refill_days'               => $request->boolean('service.other_configs.is_refill_support') ? ['required'] : [],
            'service.other_configs.refill_available_in_hours' => $request->boolean('service.other_configs.is_refill_support') ? ['required'] : [],
        ];
    }

    public function attributes()
    {
        return [
            'service.type'                => __('common.labels.type'),
            'service.category.id'         => __('common.labels.category'),
            'service.provider.id'         => __('admin/common.labels.provider'),
            'service.provider.service_id' => __('admin/services.labels.service_provider_service_id'),
            'service.name'                => __('common.labels.name'),
            'service.price_configs.original_price' => __('admin/common.labels.original_price'),
            'service.price_configs.price' => __('admin/common.labels.sell_price'),
            'service.price_configs.profit' => __('admin/common.labels.profit_value'),
            'service.min'               => __('common.labels.minimum'),
            'service.max'               => __('common.labels.maximum'),
            'service.description'       => __('common.labels.description'),
            'service.other_configs.refill_days'               => 'Support Duration',
            'service.other_configs.refill_available_in_hours' => 'Support Available In',
        ];
    }
}

class ServiceCategoryUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('service.access')
                && $admin->hasRole('service.update');
        }

        return $admin->hasRole('service.access')
            && $admin->hasRole('service.create');
    }

    public function rules()
    {
        return [
            'service' => ['required', 'array'],
            'service.ids.*' => [
                'required',
                'exists:services,id',
            ],
            'service.category.id'         => ['required', 'exists:service_categories,id'],
        ];
    }

    public function attributes()
    {
        return [
            'service.ids.*' => __('common.labels.id'),
            'service.category' => __('common.labels.category'),
        ];
    }
}

class ServiceDescriptionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('service.access')
                && $admin->hasRole('service.update');
        }

        return $admin->hasRole('service.access')
            && $admin->hasRole('service.create');
    }

    public function rules()
    {
        return [
            'services' => ['required', 'array'],
            'services.*.id' => [
                'required',
                'exists:services,id',
            ],
            'services.*.description' => [
                'required',
            ],
        ];
    }

    public function attributes()
    {
        return [
            'services.*.id' => __('common.labels.id'),
            'services.*.description' => __('common.labels.description'),
        ];
    }
}

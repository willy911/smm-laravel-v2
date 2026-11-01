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
use App\Models\Locale;
use App\Models\Service\ServiceBrand;
use App\Models\Service\ServiceCategory;
use App\Models\Service\ServiceProvider;
use App\Models\Service\ServiceProviderConfiguration;
use App\Services\Admin\Service\BrandService;
use App\Services\Admin\Service\CategoryService;
use App\Services\Admin\Service\ProviderService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class ProviderController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update']),
        ];
    }

    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.provider.access'), 403);
        if ($request->has('page')) {
            $tableItems = ServiceProvider::withTrashed()->with(['locale', 'serviceProviderConfiguration'])->when($request->input(), function ($query) use ($request) {
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
                if ($request->filled('filter.status')) {
                    $query->whereIn('status', explode(',', $request->input('filter.status')));
                }
                if ($request->input('filter.search')) {
                    $query->whereAny([
                        'id',
                        'name',
                        'alias',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                $item->setVisible([]);
                $item->locale = $item->locale->locale ?? null;
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('admin/service/provider/index', [
            'pageProps' => Inertia::defer(
                fn() => []
            )
        ]);
    }

    public function store(ProviderRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.provider.create'), 403);
        $locale = Locale::where('locale', $request->validated('service.provider.locale'))->first();
        $credentials = [
            'locale_id'     => $locale->id,
            'type'               => escape_input($request->input('service.provider.type')),
            'name'               => escape_input($request->input('service.provider.name')),
            'alias'              => escape_input($request->input('service.provider.alias')),
            'default_parameters' => $request->input('service.provider.default_parameters'),
            'is_refill_support'  => $request->boolean('service.provider.is_refill_support'),
            'is_cancel_support'  => $request->boolean('service.provider.is_cancel_support'),
        ];
        $insertData = ServiceProvider::create($credentials);
        $insertData = ServiceProviderConfiguration::create([
            'service_provider_id'               => $insertData->id,
            'account_configuration'             => $request->input('service.provider_configuration.account'),
            'services_configuration'            => $request->input('service.provider_configuration.services'),
            'order_create_configuration'        => $request->input('service.provider_configuration.order_create'),
            'order_status_configuration'        => $request->input('service.provider_configuration.order_status'),
            'order_cancel_create_configuration' => $request->input('service.provider_configuration.order_cancel_create'),
            'order_refill_create_configuration' => $request->input('service.provider_configuration.order_refill_create'),
            'order_refill_status_configuration' => $request->input('service.provider_configuration.order_refill_status'),
        ]);
        $insertActivityLog =  AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.create-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.service, admin/common:labels.provider',
                'id' => $insertData->id,
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.create_successful', [
                'item' => __('admin/common.labels.provider'),
                'id' => $insertData->id,
            ]),
        ]);
    }

    public function update(ServiceProvider $target, ProviderRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.provider.update'), 403);
        $locale = Locale::where('locale', $request->validated('service.provider.locale'))->first();
        $credentials = [
            'locale_id'     => $locale->id,
            'type'               => escape_input($request->input('service.provider.type')),
            'name'               => escape_input($request->input('service.provider.name')),
            'alias'              => escape_input($request->input('service.provider.alias')),
            'default_parameters' => $request->input('service.provider.default_parameters'),
            'is_refill_support'  => $request->boolean('service.provider.is_refill_support'),
            'is_cancel_support'  => $request->boolean('service.provider.is_cancel_support'),
        ];

        $updateData = $target->update($credentials);
        $target->serviceProviderConfiguration->update([
            'account_configuration'             => $request->input('service.provider_configuration.account'),
            'services_configuration'            => $request->input('service.provider_configuration.services'),
            'order_create_configuration'        => $request->input('service.provider_configuration.order_create'),
            'order_status_configuration'        => $request->input('service.provider_configuration.order_status'),
            'order_cancel_create_configuration' => $request->input('service.provider_configuration.order_cancel_create'),
            'order_refill_create_configuration' => $request->input('service.provider_configuration.order_refill_create'),
            'order_refill_status_configuration' => $request->input('service.provider_configuration.order_refill_status'),
        ]);
        if ($target->wasChanged()) {
            $insertActivityLog = AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content_key'  => 'admin/common:log.update-successful',
                'content_params'  => (object) [
                    'item' => 'common:labels.service, admin/common:labels.provider',
                    'id' => $target->id,
                ],
                'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
            ]);
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.update_successful', [
                'item' => __('admin/common.labels.provider'),
                'id' => $target->id,
            ]),
        ]);
    }

    public function action($action, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.provider.delete'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        if ($action === 'trash') $targets = ServiceProvider::whereIn('id', $ids)->withoutTrashed()->get();
        if (in_array($action, ['restore', 'destroy'])) {
            $targets = ServiceProvider::whereIn('id', $ids)->onlyTrashed()->get();
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
                                    'item' => 'common:labels.service, admin/common:labels.provider',
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
                                    'item' => 'common:labels.service, admin/common:labels.provider',
                                    'id' => $target->id,
                                ],
                            ]);
                        }
                        break;
                    case 'destroy':
                        if ($target->delete() && $target->forceDelete()) {
                            $target->serviceProviderConfiguration->forceDelete();
                            AdminActivityLog::create([
                                'admin_id'   => auth('admin')->user()->id,
                                'ip_address' => request()->ip(),
                                'user_agent' => request()->header('User-Agent'),
                                'content_key'  => 'admin/common:log.destroy-successful',
                                'content_params'  => (object) [
                                    'item' => 'common:labels.service, admin/common:labels.provider',
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
                'item' => __('admin/common.labels.provider'),
                'id' => implode(', ', $ids),
            ]),
        ]);
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.provider.update'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        $targets = ServiceProvider::whereIn('id', $ids)->get();
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
            if ($from != $columnValue) {
                $target->update([$columnName => $columnValue]);
                AdminActivityLog::create([
                    'admin_id'   => auth('admin')->user()->id,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->header('User-Agent'),
                    'content_key'  => 'admin/common:log.switch-successful',
                    'content_params'  => (object) [
                        'item' => 'common:labels.service, admin/common:labels.provider',
                        'id' => $target->id,
                        'column' => 'common:labels.' . $columnNameLabel . '',
                        'from' => $from,
                        'to' => $columnValue,
                    ],
                    'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
                ]);
            }
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.switch_successful', [
                'item' => __('admin/common.labels.provider'),
                'id' => implode(', ', $ids),
                'column' => __('common.labels.' . $columnNameLabel . ''),
            ]),
        ]);
    }

    public function checkBalance(ServiceProvider $target)
    {
        abort_unless(auth('admin')->user()->hasRole('service.provider.update'), 403);
        try {
            $target->load('locale');
            $serviceProviderConfig = optional($target->serviceProviderConfiguration->account_configuration);
            $formData = collect($serviceProviderConfig->params)->mapWithKeys(function ($param) use ($target) {
                if ($param->type === 'custom') {
                    return [$param->key => $param->value];
                }
                if ($param->type === 'default_parameter') {
                    return [
                        $param->key => collect($target->default_parameters)
                            ->pluck('value', 'key')
                            ->get($param->key)
                    ];
                }
                return [];
            })->toArray();
            $response = Http::withoutVerifying()->send($serviceProviderConfig->method, $serviceProviderConfig->endpoint, [
                'form_params' => $formData
            ]);
            if ($response->ok() == true) {
                if ($lastBalance = data_get($response->object(), $serviceProviderConfig->parse_response->balance)) {
                    $lastBalance = $lastBalance / $target->locale->usd_rate;
                    $lastBalance = $lastBalance;
                    $target->update([
                        'last_balance' => $lastBalance,
                    ]);
                    // $insertServiceProviderResponse = ServiceProviderResponse::create([
                    //     'type'                => 'account_profile',
                    //     'status'              => 'success',
                    //     'service_provider_id' => $target->id,
                    //     'logs'                => $response->json(),
                    // ]);
                    return response()->json([
                        'status'  => true,
                        'message' => 'Final balance successfully updated.',
                    ]);
                }
            }
            // $insertServiceProviderResponse = ServiceProviderResponse::create([
            //     'type'                => 'account_profile',
            //     'status'              => 'fail',
            //     'service_provider_id' => $target->id,
            //     'logs'                => $response->json(),
            // ]);
            return response()->json([
                'status'  => false,
                'message' => $response->json()
            ], 400);
        } catch (Exception $error) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.exception')
            ], 500);
        }
        return response()->json([
            'status'  => false,
            'message' => __('common.toast.exception')
        ], 500);
    }
}

class ProviderRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('service.provider.access')
                && $admin->hasRole('service.provider.update');
        }

        return $admin->hasRole('service.provider.access')
            && $admin->hasRole('service.provider.create');
    }

    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        if ($request->input('service.provider.type') === 'manual') {
            return [
                'service.provider.name'   => ['required', Rule::unique('service_providers', 'name')->ignore($id)],
                'service.provider.alias'  => ['required', Rule::unique('service_providers', 'alias')->ignore($id)],
                'service.provider.locale' => ['required', 'exists:locales,locale'],
            ];
        }

        $regexKey = ['regex:/^[A-Za-z._]+$/'];
        $methods = ['in:get,post'];

        return [
            'service.provider.name'   => ['required', Rule::unique('service_providers', 'name')->ignore($id)],
            'service.provider.alias'  => ['required', Rule::unique('service_providers', 'alias')->ignore($id)],
            'service.provider.locale' => ['required', 'exists:locales,locale'],
            'service.provider_configuration.services.profit_configs.type' => [
                'required',
            ],
            'service.provider_configuration.services.profit_configs.value' => [
                'required',
                'numeric',
            ],

            'service.provider.default_parameters.*.key'   => ['required'],
            'service.provider.default_parameters.*.value' => ['required'],

            'service.provider_configuration.account.endpoint'               => ['required', 'url:https', 'active_url'],
            'service.provider_configuration.account.method'                 => ['required', ...$methods],
            'service.provider_configuration.account.params.*.type'          => ['required', 'in:custom,default_parameter'],
            'service.provider_configuration.account.params.*.key'           => ['required'],
            'service.provider_configuration.account.params.*.value'         => ['required_if:service.provider_configuration.account.params.*.type,custom'],
            'service.provider_configuration.account.example_response'       => ['required'],
            'service.provider_configuration.account.parse_response.balance' => ['required', ...$regexKey],

            'service.provider_configuration.services.endpoint'         => ['required', 'url:https', 'active_url'],
            'service.provider_configuration.services.method'           => ['required', ...$methods],
            'service.provider_configuration.services.params.*.type'    => ['required', 'in:custom,default_parameter'],
            'service.provider_configuration.services.params.*.key'     => ['required'],
            'service.provider_configuration.services.params.*.value'   => ['required_if:service.provider_configuration.services.params.*.type,custom'],
            'service.provider_configuration.services.example_response' => ['required'],
            'service.provider_configuration.services.parse_response.*' => ['required', ...$regexKey],

            'service.provider_configuration.services.parse_response.looping'                    => ['nullable', ...$regexKey],
            'service.provider_configuration.services.parse_response.description'                => ['nullable', ...$regexKey],
            'service.provider_configuration.services.parse_response.type'                       => ['nullable', ...$regexKey],
            'service.provider_configuration.services.parse_response.refill_days'                => ['nullable', ...$regexKey],
            'service.provider_configuration.services.parse_response.refill_available_in_hours'  => ['nullable', ...$regexKey],

            'service.provider_configuration.services.parse_text.name.*.from' => ['required'],
            'service.provider_configuration.services.parse_text.name.*.to'   => ['required'],
            'service.provider_configuration.services.parse_text.type.*'      => ['required'],

            'service.provider_configuration.order_create.endpoint'         => ['required', 'url:https', 'active_url'],
            'service.provider_configuration.order_create.method'           => ['required', ...$methods],
            'service.provider_configuration.order_create.params.*.type'    => ['required', 'in:custom,default_parameter,service_id,order_target,order_quantity,order_comments,order_usernames,order_username,order_hashtags,order_hashtag,order_media_url,order_answer_number'],
            'service.provider_configuration.order_create.params.*.key'     => ['required'],
            'service.provider_configuration.order_create.params.*.value'   => ['required_if:service.provider_configuration.order_create.params.*.type,custom'],
            'service.provider_configuration.order_create.example_response' => ['required'],
            'service.provider_configuration.order_create.parse_response.order_id' => ['required', ...$regexKey],

            'service.provider_configuration.order_status.endpoint'         => ['required', 'url:https', 'active_url'],
            'service.provider_configuration.order_status.method'           => ['required', ...$methods],
            'service.provider_configuration.order_status.order_id_separator' => ['required_if:service.provider_configuration.order_status.send_request_as_bulk,true'],
            'service.provider_configuration.order_status.params.*.type'    => ['required', 'in:custom,default_parameter,order_id'],
            'service.provider_configuration.order_status.params.*.key'     => ['required'],
            'service.provider_configuration.order_status.params.*.value'   => ['required_if:service.provider_configuration.order_status.params.*.type,custom'],
            'service.provider_configuration.order_status.example_response' => ['required'],
            'service.provider_configuration.order_status.parse_response.status'      => ['required', ...$regexKey],
            'service.provider_configuration.order_status.parse_response.start_count' => ['required', ...$regexKey],
            'service.provider_configuration.order_status.parse_response.remains'     => ['required', ...$regexKey],
            'service.provider_configuration.order_status.parse_text.status.*'        => ['required'],

            'service.provider_configuration.order_cancel_create.endpoint'               => $request->boolean('service.provider.is_cancel_support') ? ['required', 'url:https', 'active_url'] : [],
            'service.provider_configuration.order_cancel_create.method'                 => $request->boolean('service.provider.is_cancel_support') ? ['required', 'in:get,post'] : [],
            'service.provider_configuration.order_cancel_create.order_id_separator'   => $request->boolean('service.provider.is_cancel_support') && $request->boolean('service.provider_configuration.order_cancel_create.send_request_as_bulk') ? ['required'] : [],
            'service.provider_configuration.order_cancel_create.params.*.type'          => $request->boolean('service.provider.is_cancel_support') ? ['required', 'in:custom,default_parameter,order_id'] : [],
            'service.provider_configuration.order_cancel_create.params.*.key'           => $request->boolean('service.provider.is_cancel_support') ? ['required'] : [],
            'service.provider_configuration.order_cancel_create.params.*.value'         => $request->boolean('service.provider.is_cancel_support') ? ['required_if:service.provider_configuration.order_cancel_create.params.*.type,custom'] : [],
            'service.provider_configuration.order_cancel_create.example_response'       => $request->boolean('service.provider.is_cancel_support') ? ['required'] : [],
            'service.provider_configuration.order_cancel_create.parse_response.looping'   => $request->boolean('service.provider.is_cancel_support') && $request->boolean('service.provider_configuration.order_cancel_create.send_request_as_bulk') ? ['nullable', 'regex:/^[A-Za-z._]+$/'] : [],
            'service.provider_configuration.order_cancel_create.parse_response.order_cancel_id' => $request->boolean('service.provider.is_cancel_support') ? ['required', 'regex:/^[A-Za-z._]+$/'] : [],

            'service.provider_configuration.order_refill_create.endpoint'               => $request->boolean('service.provider.is_refill_support') ? ['required', 'url:https', 'active_url'] : [],
            'service.provider_configuration.order_refill_create.method'                 => $request->boolean('service.provider.is_refill_support') ? ['required', 'in:get,post'] : [],
            'service.provider_configuration.order_refill_create.order_id_separator'   => $request->boolean('service.provider.is_refill_support') && $request->boolean('service.provider_configuration.order_refill_create.send_request_as_bulk') ? ['required'] : [],
            'service.provider_configuration.order_refill_create.params.*.type'          => $request->boolean('service.provider.is_refill_support') ? ['required', 'in:custom,default_parameter,order_id'] : [],
            'service.provider_configuration.order_refill_create.params.*.key'           => $request->boolean('service.provider.is_refill_support') ? ['required'] : [],
            'service.provider_configuration.order_refill_create.params.*.value'         => $request->boolean('service.provider.is_refill_support') ? ['required_if:service.provider_configuration.order_refill_create.params.*.type,custom'] : [],
            'service.provider_configuration.order_refill_create.example_response'       => $request->boolean('service.provider.is_refill_support') ? ['required'] : [],
            'service.provider_configuration.order_refill_create.parse_response.looping'   => $request->boolean('service.provider.is_refill_support') && $request->boolean('service.provider_configuration.order_refill_create.send_request_as_bulk') ? ['nullable', 'regex:/^[A-Za-z._]+$/'] : [],
            'service.provider_configuration.order_refill_create.parse_response.order_refill_id' => $request->boolean('service.provider.is_refill_support') ? ['required', 'regex:/^[A-Za-z._]+$/'] : [],

            'service.provider_configuration.order_refill_status.endpoint'               => $request->boolean('service.provider.is_refill_support') ? ['required', 'url:https', 'active_url'] : [],
            'service.provider_configuration.order_refill_status.method'                 => $request->boolean('service.provider.is_refill_support') ? ['required', 'in:get,post'] : [],
            // 'service.provider_configuration.order_refill_status.order_refill_id_separator'   => $request->boolean('service.provider.is_refill_support') && $request->boolean('service.provider_configuration.order_refill_status.send_request_as_bulk') ? ['required'] : [],
            'service.provider_configuration.order_refill_status.params.*.type'          => $request->boolean('service.provider.is_refill_support') ? ['required', 'in:custom,default_parameter,order_refill_id'] : [],
            'service.provider_configuration.order_refill_status.params.*.key'           => $request->boolean('service.provider.is_refill_support') ? ['required'] : [],
            'service.provider_configuration.order_refill_status.params.*.value'         => $request->boolean('service.provider.is_refill_support') ? ['required_if:service.provider_configuration.order_refill_status.params.*.type,custom'] : [],
            'service.provider_configuration.order_refill_status.example_response'       => $request->boolean('service.provider.is_refill_support') ? ['required'] : [],
            'service.provider_configuration.order_refill_status.parse_response.looping'   => $request->boolean('service.provider.is_refill_support') && $request->boolean('service.provider_configuration.order_refill_status.send_request_as_bulk') ? ['nullable', 'regex:/^[A-Za-z._]+$/'] : [],
            'service.provider_configuration.order_refill_status.parse_response.status' => $request->boolean('service.provider.is_refill_support') ? ['required', 'regex:/^[A-Za-z._]+$/'] : [],
            'service.provider_configuration.order_refill_status.parse_text.status.*'       => $request->boolean('service.provider.is_refill_support') ? ['required'] : [],
        ];

        return [
            'service.provider.name'      => ['required'],
            'service.provider_configuration.services.profit_configs.type' => [
                'required',
            ],
            'service.provider_configuration.services.profit_configs.value' => [
                'required',
                'numeric',
            ],
        ];
    }

    public function attributes()
    {
        return [
            'service.provider.name'     => 'Name',
            'service.provider.alias'     => 'Alias',
            'service.provider.locale' => 'Currency',
            'service.provider_configuration.services.profit_configs.type' => 'Type',
            'service.provider_configuration.services.profit_configs.value' => 'Value',
            'service.provider.default_parameters.*.key'                     => 'Key',
            'service.provider.default_parameters.*.value'                   => 'Value',

            'service.provider_configuration.account.endpoint'               => 'Endpoint',
            'service.provider_configuration.account.method'                 => 'Method',
            'service.provider_configuration.account.params.*.type'          => 'Type',
            'service.provider_configuration.account.params.*.key'           => 'Key',
            'service.provider_configuration.account.params.*.value'         => 'Value',
            'service.provider_configuration.account.example_response'       => 'Example Response',
            'service.provider_configuration.account.parse_response.balance' => 'Account Balance',

            'service.provider_configuration.services.endpoint'                => 'Endpoint',
            'service.provider_configuration.services.method'                  => 'Method',
            'service.provider_configuration.services.params.*.type'           => 'Type',
            'service.provider_configuration.services.params.*.key'            => 'Key',
            'service.provider_configuration.services.params.*.value'          => 'Value',
            'service.provider_configuration.services.example_response'        => 'Example Response',
            'service.provider_configuration.services.parse_response.looping'  => 'Looping',
            'service.provider_configuration.services.parse_response.id'       => 'ID',
            'service.provider_configuration.services.parse_response.category' => 'Category',
            'service.provider_configuration.services.parse_response.name'     => 'Name',
            'service.provider_configuration.services.parse_response.price'    => 'Price',
            'service.provider_configuration.services.parse_response.min'      => 'Min.',
            'service.provider_configuration.services.parse_response.max'      => 'Max.',
            'service.provider_configuration.services.parse_response.description' => 'Description',
            'service.provider_configuration.services.parse_response.is_refill_support' => 'Refill Support',
            'service.provider_configuration.services.parse_response.is_cancel_support' => 'Cancel Support',
            'service.provider_configuration.services.parse_response.refill_days' => 'Refill Support Duration',
            'service.provider_configuration.services.parse_response.refill_available_in_hours' => 'Refill Support Availability Time',
            'service.provider_configuration.services.parse_response.type' => 'Type',
            'service.provider_configuration.services.parse_text.name.*.from'  => 'From',
            'service.provider_configuration.services.parse_text.name.*.to'    => 'To',
            'service.provider_configuration.services.parse_text.type.primary'    => 'Primary',
            'service.provider_configuration.services.parse_text.type.package'    => 'Package',
            'service.provider_configuration.services.parse_text.type.custom_comments'    => 'Custom Comments',
            'service.provider_configuration.services.parse_text.type.custom_comments_package'    => 'Custom Comments Package',
            'service.provider_configuration.services.parse_text.type.comment_likes'    => 'Comment Likes',
            'service.provider_configuration.services.parse_text.type.comment_replies'    => 'Comment Replies',
            'service.provider_configuration.services.parse_text.type.mentions_hashtag'    => 'Mentions Hashtag',
            'service.provider_configuration.services.parse_text.type.mentions_with_hashtags'    => 'Mentions With Hashtags',
            'service.provider_configuration.services.parse_text.type.mentions_custom_list'    => 'Mentions Custom List',
            'service.provider_configuration.services.parse_text.type.mentions_user_followers'    => 'Mentions User Followers',
            'service.provider_configuration.services.parse_text.type.mentions_media_likers'    => 'Mentions Media Likers',
            'service.provider_configuration.services.parse_text.type.poll'    => 'Poll',
            'service.provider_configuration.services.parse_text.type.subscriptions'    => 'Subscriptions',

            'service.provider_configuration.order_create.endpoint'               => 'Endpoint',
            'service.provider_configuration.order_create.method'                 => 'Method',
            'service.provider_configuration.order_create.params.*.type'          => 'Type',
            'service.provider_configuration.order_create.params.*.key'           => 'Key',
            'service.provider_configuration.order_create.params.*.value'         => 'Value',
            'service.provider_configuration.order_create.example_response'       => 'Example Response',
            'service.provider_configuration.order_create.parse_response.order_id' => 'Order ID',

            'service.provider_configuration.order_status.endpoint'               => 'Endpoint',
            'service.provider_configuration.order_status.method'                 => 'Method',
            'service.provider_configuration.order_status.order_id_separator'   => 'Order ID Separator',
            'service.provider_configuration.order_status.params.*.type'          => 'Type',
            'service.provider_configuration.order_status.params.*.key'           => 'Key',
            'service.provider_configuration.order_status.params.*.value'         => 'Value',
            'service.provider_configuration.order_status.example_response'       => 'Example Response',
            'service.provider_configuration.order_status.parse_response.looping'   => 'Looping',
            'service.provider_configuration.order_status.parse_response.status' => 'Status',
            'service.provider_configuration.order_status.parse_response.start_count' => 'Start Count',
            'service.provider_configuration.order_status.parse_response.remains' => 'Remains',
            'service.provider_configuration.order_status.parse_text.status.*'       => 'Status',

            'service.provider_configuration.order_cancel_create.endpoint'               => 'Endpoint',
            'service.provider_configuration.order_cancel_create.method'                 => 'Method',
            'service.provider_configuration.order_cancel_create.order_id_separator'        => 'Order ID Separator',
            'service.provider_configuration.order_cancel_create.params.*.type'          => 'Type',
            'service.provider_configuration.order_cancel_create.params.*.key'           => 'Key',
            'service.provider_configuration.order_cancel_create.params.*.value'         => 'Value',
            'service.provider_configuration.order_cancel_create.example_response'       => 'Example Response',
            'service.provider_configuration.order_cancel_create.parse_response.looping'   => 'Looping',
            'service.provider_configuration.order_cancel_create.parse_response.order_cancel_id' => 'Order Cancel ID',

            'service.provider_configuration.order_refill_create.endpoint'               => 'Endpoint',
            'service.provider_configuration.order_refill_create.method'                 => 'Method',
            'service.provider_configuration.order_refill_create.order_id_separator'        => 'Order ID Separator',
            'service.provider_configuration.order_refill_create.params.*.type'          => 'Type',
            'service.provider_configuration.order_refill_create.params.*.key'           => 'Key',
            'service.provider_configuration.order_refill_create.params.*.value'         => 'Value',
            'service.provider_configuration.order_refill_create.example_response'       => 'Example Response',
            'service.provider_configuration.order_refill_create.parse_response.looping'   => 'Looping',
            'service.provider_configuration.order_refill_create.parse_response.order_refill_id' => 'Order Refill ID',

            'service.provider_configuration.order_refill_status.endpoint'               => 'Endpoint',
            'service.provider_configuration.order_refill_status.method'                 => 'Method',
            'service.provider_configuration.order_refill_status.order_refill_id_separator'   => 'Order Refill ID Separator',
            'service.provider_configuration.order_refill_status.params.*.type'          => 'Type',
            'service.provider_configuration.order_refill_status.params.*.key'           => 'Key',
            'service.provider_configuration.order_refill_status.params.*.value'         => 'Value',
            'service.provider_configuration.order_refill_status.example_response'       => 'Example Response',
            'service.provider_configuration.order_refill_status.parse_response.looping'   => 'Looping',
            'service.provider_configuration.order_refill_status.parse_response.status' => 'Status',
            'service.provider_configuration.order_refill_status.parse_text.status.*'       => 'Status',
        ];
    }
}

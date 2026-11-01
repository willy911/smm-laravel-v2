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

namespace App\Http\Controllers\Admin;

use Exception;
use Inertia\Inertia;
use App\Models\Admin\Admin;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Models\PaymentMethod;
use App\Models\Product\ProductCategory;
use App\Services\Admin\PaymentMethodService;
use App\Services\Admin\Product\CategoryGroupService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Storage;

class PaymentMethodController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update']),
        ];
    }

    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('payment_method.access'), 403);
        if ($request->has('page')) {
            $tableItems = PaymentMethod::withTrashed()->when($request->input(), function ($query) use ($request) {
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
                if ($request->filled('filter.type')) {
                    $query->whereIn('type', explode(',', $request->input('filter.type')));
                }
                if ($request->filled('filter.payment_gateway')) {
                    $query->whereIn('payment_gateway', explode(',', $request->input('filter.payment_gateway')));
                }
                if ($request->filled('filter.status')) {
                    $query->whereIn('status', explode(',', $request->input('filter.status')));
                }
                if ($request->input('filter.search')) {
                    $query->whereAny([
                        'id',
                        'type',
                        'name',
                        'payment_gateway',
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
        return inertia('admin/payment-method/index', [
            'pageProps' => Inertia::defer(
                fn() => []
            )
        ]);
    }

    public function store(PaymentMethodRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('payment_method.create'), 403);
        $credentials = [
            'type' => $request->input('payment_method.type'),
            'name' => $request->input('payment_method.name'),
            'minimum' => $request->input('payment_method.minimum'),
            'maximum' => $request->input('payment_method.maximum'),
            'admin_fee_configs' => $request->input('payment_method.admin_fee_configs'),
            'bonus_configs' => $request->input('payment_method.bonus_configs'),
            'payment_target' => $request->input('payment_method.payment_target'),
            'payment_gateway' => $request->input('payment_method.payment_gateway'),
            'payment_gateway_payment_code' => $request->input('payment_method.payment_gateway_payment_code'),
        ];

        if ($request->hasFile('payment_method.logo')) {
            $file = $request->file('payment_method.logo');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            Storage::disk('r2')->putFileAs('payment-methods', $file, $filename);
            $credentials['logo'] = $filename;
        }

        $insertData = PaymentMethod::create($credentials);
        $insertActivityLog =  AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.create-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.payment-method',
                'id' => $insertData->id,
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.create_successful', [
                'item' => __('common.labels.payment_method'),
                'id' => $insertData->id,
            ]),
        ]);
    }

    public function update(PaymentMethod $target, PaymentMethodRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('payment_method.update'), 403);
        $credentials = [
            'type' => $request->input('payment_method.type'),
            'name' => $request->input('payment_method.name'),
            'minimum' => $request->input('payment_method.minimum'),
            'maximum' => $request->input('payment_method.maximum'),
            'admin_fee_configs' => $request->input('payment_method.admin_fee_configs'),
            'bonus_configs' => $request->input('payment_method.bonus_configs'),
            'payment_target' => $request->input('payment_method.payment_target'),
            'payment_gateway' => $request->input('payment_method.payment_gateway'),
            'payment_gateway_payment_code' => $request->input('payment_method.payment_gateway_payment_code'),
        ];

        if ($request->hasFile('payment_method.logo')) {
            $file = $request->file('payment_method.logo');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            Storage::disk('r2')->putFileAs('payment-methods', $file, $filename);
            $credentials['logo'] = $filename;
        }

        $updateData = $target->update($credentials);
        if ($target->wasChanged()) {
            $insertActivityLog = AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content_key'  => 'admin/common:log.update-successful',
                'content_params'  => (object) [
                    'item' => 'common:labels.payment-method',
                    'id' => $target->id,
                ],
                'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
            ]);
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.update_successful', [
                'item' => __('common.labels.payment_method'),
                'id' => $target->id,
            ]),
        ]);
    }

    public function action($action, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('payment_method.delete'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        if ($action === 'trash') $targets = PaymentMethod::whereIn('id', $ids)->withoutTrashed()->get();
        if (in_array($action, ['restore', 'destroy'])) {
            $targets = PaymentMethod::whereIn('id', $ids)->onlyTrashed()->get();
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
                                    'item' => 'common:labels.payment-method',
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
                                    'item' => 'common:labels.payment-method',
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
                                    'item' => 'common:labels.payment-method',
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
                ]);
            }
        }
        return response()->json([
            'status'  => true,
            'message' => __("admin/common.toast.{$action}_successful", [
                'item' => __('common.labels.payment_method'),
                'id' => implode(', ', $ids),
            ]),
        ]);
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('payment_method.update'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        $targets = PaymentMethod::whereIn('id', $ids)->get();
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
            if ($columnName == 'type') {
                $columnNameLabel = 'type';
                $from = $target->type;
            }
            if ($from != $columnValue) {
                $target->update([$columnName => $columnValue]);
                AdminActivityLog::create([
                    'admin_id'   => auth('admin')->user()->id,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->header('User-Agent'),
                    'content_key'  => 'admin/common:log.switch-successful',
                    'content_params'  => (object) [
                        'item' => 'common:labels.payment-method',
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
                'item' => __('common.labels.payment_method'),
                'id' => implode(', ', $ids),
                'column' => __('common.labels.' . $columnNameLabel . ''),
            ]),
        ]);
    }

    public function options(Request $request, PaymentMethodService $paymentMethodService)
    {
        $items = collect($paymentMethodService->getOptions());
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
        abort_unless(auth('admin')->user()->hasRole('payment_method.update'), 403);
        foreach ($request->input('items') as $index => $item) {
            PaymentMethod::whereId($item['value'])->update([
                'sort_number' => $index + 1
            ]);
        }
        $insertActivityLog = AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.sort-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.payment-method',
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.sort_successful', [
                'item' => __('common.labels.payment_method'),
            ]),
        ]);
    }
}

class PaymentMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('payment_method.access')
                && $admin->hasRole('payment_method.update');
        }

        return $admin->hasRole('payment_method.access')
            && $admin->hasRole('payment_method.create');
    }

    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        return [
            'payment_method.type'  => ['required'],
            'payment_method.name'      => ['required', Rule::unique('payment_methods', 'name')->ignore($id)],
            'payment_method.minimum' => [
                'required',
                'numeric',
                'lte:payment_method.maximum',
            ],
            'payment_method.maximum' => [
                'required',
                'numeric',
                'gte:payment_method.minimum',
            ],
            'payment_method.admin_fee_configs.type' => [
                'required',
            ],
            'payment_method.admin_fee_configs.value' => [
                'required',
                'numeric',
            ],
            'payment_method.bonus_configs.*.min' => [
                'required',
                'numeric',
                'lte:payment_method.bonus_configs.*.max',
            ],
            'payment_method.bonus_configs.*.max' => [
                'required',
                'numeric',
                'gte:payment_method.bonus_configs.*.min',
            ],
            'payment_method.bonus_configs.*.bonus' => [
                'required',
                'numeric',
                'min:0'
            ],
            'payment_method.payment_target'  => [
                Rule::requiredIf(fn() => !$request->input('payment_method.payment_gateway')),
            ],
            'payment_method.payment_gateway'  => [
                Rule::requiredIf(fn() => !$request->input('payment_method.payment_target')),
            ],
            'payment_method.payment_gateway_payment_code'  => [
                Rule::requiredIf(fn() => !$request->input('payment_method.payment_target')),
            ],
            'payment_method.logo' => [
                ...$this->isPrecognitive() ? [] : [(!$id ? 'required' : 'nullable'), 'mimes:jpeg,png,jpg,webp,svg,avif', 'max:5048'],
            ],
        ];
    }

    public function attributes()
    {
        return [
            'payment_method.type' => __('common.labels.type'),
            'payment_method.name'  => __('common.labels.name'),
            'payment_method.minimum' => __('common.labels.minimum'),
            'payment_method.maximum' => __('common.labels.maximum'),
            'payment_method.admin_fee_configs.type' => __('admin/payment-methods.labels.admin_fee_type'),
            'payment_method.admin_fee_configs.value' => __('admin/payment-methods.labels.admin_fee_value'),
            'payment_method.bonus_configs.*.min' => __('common.labels.minimum'),
            'payment_method.bonus_configs.*.max' => __('common.labels.maximum'),
            'payment_method.bonus_configs.*.bonus' => __('admin/payment-methods.labels.bonus_value'),
            'payment_method.payment_target'  => __('admin/payment-methods.labels.payment_target'),
            'payment_method.payment_gateway'  => __('admin/payment-methods.labels.payment_gateway'),
            'payment_method.payment_gateway_payment_code'  => __('admin/payment-methods.labels.payment_gateway_payment_code'),
            'payment_method.logo' => __('common.labels.logo'),
        ];
    }
}

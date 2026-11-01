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

namespace App\Http\Controllers\Admin\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Enums\Admin\Admin as AdminEnum;
use App\Models\Admin\Admin;
use App\Models\Admin\AdminRole;
use App\Services\Admin\Admin\GroupService;
use Exception;
use Illuminate\Support\Facades\Hash;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update']),
        ];
    }

    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);
        if ($request->has('page')) {
            // $tableItems = Admin::with('adminRole')->withTrashed()->when($request->input(), function ($query) use ($request) {
            $tableItems = Admin::withTrashed()->with('adminGroup')->when($request->input(), function ($query) use ($request) {
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
                if ($request->input('filter.search')) {
                    $query->where(function ($query) use ($request) {
                        $query->whereAny([
                            'id',
                            'full_name',
                            'username',
                        ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                    });
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                $item->admin_group = $item->adminGroup;
                $item->makeVisible([
                    'admin_group',
                ]);
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        $groupService = new GroupService();
        return inertia('admin/admin/index', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'adminGroups' => [
                        'options' => $groupService->getOptions(),
                        'filters' => $groupService->getFilters(),
                    ],
                ]
            )
        ]);
    }

    public function store(AdminRequest $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);
        $credentials = [
            'locale_id'     => 1,
            'admin_group_id' => escape_input($request->input('admin.group.id')),
            'full_name'     => escape_input($request->input('admin.full_name')),
            'username'      => escape_input($request->input('admin.username')),
            'password'      => escape_input(Hash::make($request->input('admin.password'))),
        ];
        $insertData = Admin::create($credentials);
        $insertActivityLog =  AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.create-successful',
            'content_params'  => (object) [
                'item' => 'admin/common:labels.admin',
                'id' => $insertData->id,
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.create_successful', [
                'item' => __('admin/common.labels.admin'),
                'id' => $insertData->id,
            ]),
        ]);
    }

    public function show(Admin $target)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);
        return inertia('Admin/User/Detail', [
            'pageProps' => [
                'target'       => $target->load('userGroup')->load(['userSigninLogs' => function ($query) {
                    $query->latest()->limit(1);
                }])->loadSum(['orders' => function ($query) {
                    $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
                    $query->where('status', 'completed');
                }], 'price')->loadCount(['orders' => function ($query) {
                    $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
                    $query->where('status', 'completed');
                }])->loadSum(['deposits' => function ($query) {
                    $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
                    $query->where('status', 'success');
                }], 'amount')->loadCount(['deposits' => function ($query) {
                    $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
                    $query->where('status', 'success');
                }]),
                'totalOrders'   => [
                    'total' => Order::where([
                        ['user_id', $target->id],
                        ['status', 'completed'],
                    ])->count('id'),
                    'price' => Order::where([
                        ['user_id', $target->id],
                        ['status', 'completed'],
                    ])->sum('price'),
                ],
                'lastOrders'   => Order::with(['service', 'service'])->where('user_id', $target->id)->latest()->limit(5)->get(),
                'totalDeposits' => [
                    'total' => Deposit::where([
                        ['user_id', $target->id],
                        ['status', 'success'],
                    ])->count('id'),
                    'amount' => Deposit::where([
                        ['user_id', $target->id],
                        ['status', 'success'],
                    ])->sum('amount'),
                ],
                'lastDeposits' => Deposit::where('user_id', $target->id)->latest()->limit(5)->get(),
            ]
        ]);
    }

    public function update(Admin $target, AdminRequest $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);
        $credentials = [
            'admin_group_id' => escape_input($request->input('admin.group.id')),
            'full_name'     => escape_input($request->input('admin.full_name')),
            'username'      => escape_input($request->input('admin.username')),
        ];
        if ($request->input('admin.password')) $credentials['password'] = Hash::make($request->input('admin.password'));
        $updateData = $target->update($credentials);
        if ($target->wasChanged()) {
            $insertActivityLog =  AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content_key'  => 'admin/common:log.update-successful',
                'content_params'  => (object) [
                    'item' => 'admin/common:labels.admin',
                    'id' => $target->id,
                ],
                'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
            ]);
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.update_successful', [
                'item' => __('admin/common.labels.admin'),
                'id' => $target->id,
            ]),
        ]);
    }

    public function action($action, Request $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.invalid_id'),
            ], 400);
        }
        if ($action === 'trash') $targets = Admin::whereIn('id', $ids)->withoutTrashed()->get();
        if (in_array($action, ['restore', 'destroy'])) {
            $targets = Admin::whereIn('id', $ids)->onlyTrashed()->get();
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
                                    'item' => 'admin/common:labels.admin',
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
                                    'item' => 'admin/common:labels.admin',
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
                                    'item' => 'admin/common:labels.admin',
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
                'item' => __('admin/common.labels.admin'),
                'id' => implode(', ', $ids),
            ]),
        ]);
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.invalid_id'),
            ], 400);
        }
        $targets = Admin::whereIn('id', $ids)->get();
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
            if ($columnName == 'admin_group_id') {
                $columnNameLabel = 'group';
                $from = $target->admin_group_id;
            }
            if ($from != $columnValue) {
                $target->update([$columnName => $columnValue]);
                AdminActivityLog::create([
                    'admin_id'   => auth('admin')->user()->id,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->header('User-Agent'),
                    'content_key'  => 'admin/common:log.switch-successful',
                    'content_params'  => (object) [
                        'item' => 'admin/common:labels.admin',
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
                'item' => __('admin/common.labels.admin'),
                'id' => implode(', ', $ids),
                'column' => __('common.labels.' . $columnNameLabel . ''),
            ]),
        ]);
    }
}

class AdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('admin')->user()->group->is_primary;
    }

    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        return [
            // 'admin.role.id'   => ['required', 'exists:admin_roles,id'],
            'admin.group.id'  => ['required', 'exists:admin_groups,id'],
            'admin.full_name' => ['required', 'min:8', 'max:20', 'regex:/^[\pL\s\-]+$/u', Rule::unique('admins', 'full_name')->ignore($id)],
            'admin.username'  => ['required', 'alpha_num:ascii', 'min:8', 'max:20', Rule::unique('admins', 'username')->ignore($id)],
            'admin.password'  => $id === null ? [
                'required',
                'regex:/^[\w\d\p{P}\p{S}]+$/u',
                'min:8',
                'max:20'
            ] : ['nullable'],
        ];
    }

    public function attributes()
    {
        return [
            // 'admin.role.id'   => 'Akses/Peran',
            'admin.group.id'  => __('common.labels.group'),
            'admin.full_name' => __('common.labels.full_name'),
            'admin.username' => __('common.labels.username'),
            'admin.password' => __('common.labels.password'),
        ];
    }
}

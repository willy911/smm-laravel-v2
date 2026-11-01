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

namespace App\Http\Controllers\Admin\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Models\User\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;
use App\Enums\User\User as UserEnum;
use App\Models\Deposit\Deposit;
use App\Models\Locale;
use App\Models\Order\Order;
use App\Models\User\UserBalanceLog;
use App\Models\User\UserGroup;
use App\Services\Admin\User\GroupService;
use App\Services\Admin\User\UserService;
use Exception;
use Illuminate\Http\Exceptions\HttpResponseException;
use Inertia\Inertia;

class UserController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update', 'balanceReduction']),
        ];
    }

    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('user.access'), 403);
        if ($request->has('page')) {
            $userService = new UserService($request);
            $tableItems = $userService->getTableItems();
            $summary = $userService->getSummary();
            return response()->json([
                'status' => true,
                'data' => $tableItems,
                'summary' => $summary,
            ]);
        }
        $groupService = new GroupService();
        return inertia('admin/user/index', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'userGroups' => [
                        'options' => $groupService->getOptions(),
                        'filters' => $groupService->getFilters(),
                    ],
                ]
            )
        ]);
    }

    public function store(UserRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('user.create'), 403);
        $locale = Locale::first();
        $credentials = [
            'locale_id'     => $locale->id,
            'user_group_id' => escape_input($request->input('user.group.id')),
            'full_name'     => escape_input($request->input('user.full_name')),
            'email'         => escape_input($request->input('user.email')),
            'whatsapp'      => escape_input($request->input('user.whatsapp')),
            'username'      => escape_input($request->input('user.username')),
            'password'      => escape_input(Hash::make($request->input('user.password'))),
            'service_discount' => escape_input($request->input('user.service_discount')),
            'api'           => [
                'api_key'      => generate_api_key(),
                'secret_key'   => '',
                'whitelist_ip' => '',
            ],
            'notification' => [
                'order'   => ['email' => 0, 'whatsapp' => 0, 'telegram' => 0],
                'deposit' => ['email' => 0, 'whatsapp' => 0, 'telegram' => 0],
                'ticket'  => ['email' => 0, 'whatsapp' => 0, 'telegram' => 0],
            ],
        ];
        $insertData = User::create($credentials);
        $insertActivityLog =  AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.create-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.user',
                'id' => $insertData->id,
            ],
        ]);
        $userService = new UserService($request);
        $userService->invalidateAdminUsersCache();
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.create_successful', [
                'item' => __('common.labels.user'),
                'id' => $insertData->id,
            ]),
        ]);
    }

    public function show(User $target)
    {
        abort_unless(auth('admin')->user()->hasRole('user.access'), 403);
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

    public function update(User $target, UserRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('user.update'), 403);
        $credentials = [
            'user_group_id' => escape_input($request->input('user.group.id')),
            'full_name'     => escape_input($request->input('user.full_name')),
            'email'         => escape_input($request->input('user.email')),
            'whatsapp'      => escape_input($request->input('user.whatsapp')),
            'username'      => escape_input($request->input('user.username')),
            'service_discount' => escape_input($request->input('user.service_discount')),
        ];
        if ($request->input('user.password')) $credentials['password'] = Hash::make($request->input('user.password'));
        $updateData = $target->update($credentials);
        if ($target->wasChanged()) {
            $insertActivityLog =  AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content_key'  => 'admin/common:log.update-successful',
                'content_params'  => (object) [
                    'item' => 'common:labels.user',
                    'id' => $target->id,
                ],
                'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
            ]);
            $userService = new UserService($request);
            $userService->invalidateAdminUsersCache();
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.update_successful', [
                'item' => __('common.labels.user'),
                'id' => $target->id,
            ]),
        ]);
    }

    public function action($action, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('user.delete'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.invalid_id'),
            ], 400);
        }
        if ($action === 'trash') $targets = User::whereIn('id', $ids)->withoutTrashed()->get();
        if (in_array($action, ['restore', 'destroy'])) {
            $targets = User::whereIn('id', $ids)->onlyTrashed()->get();
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
                                    'item' => 'common:labels.user',
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
                                    'item' => 'common:labels.user',
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
                                    'item' => 'common:labels.user',
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
        $userService = new UserService($request);
        $userService->invalidateAdminUsersCache();
        return response()->json([
            'status'  => true,
            'message' => __("admin/common.toast.{$action}_successful", [
                'item' => __('common.labels.user'),
                'id' => implode(', ', $ids),
            ]),
        ]);
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('user.update'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.invalid_id'),
            ], 400);
        }
        $targets = User::whereIn('id', $ids)->get();
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
                        'item' => 'common:labels.user',
                        'id' => $target->id,
                        'column' => 'common:labels.' . $columnNameLabel . '',
                        'from' => $from,
                        'to' => $columnValue,
                    ],
                    'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
                ]);
            }
        }
        $userService = new UserService($request);
        $userService->invalidateAdminUsersCache();
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.switch_successful', [
                'item' => __('common.labels.user'),
                'id' => implode(', ', $ids),
                'column' => __('common.labels.' . $columnNameLabel . ''),
            ]),
        ]);
    }

    public function options(Request $request)
    {
        $users = User::whereAny([
            'full_name',
            'username',
            'email',
            'whatsapp',
            'balance',
        ], 'LIKE', '%' . ($request->input('search')) . '%')->orderByRaw('id DESC')->get();
        if ($users->count() >= 1) {
            $list = [];
            foreach ($users as $user) {
                $list[] = [
                    'id'               => $user->id,
                    'name'             => $user->username,
                    'value'            => $user->id,
                    'label'            => $user->id . ' - ' . $user->username,
                ];
            }
            return response()->json([
                'status' => true,
                'list'  => $list,
            ]);
        }
        return response()->json([
            'status'  => false,
            'message' => 'Pengguna tidak tersedia.'
        ]);
    }

    public function balanceReduction(BalanceReductionRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('user.update'), 403);
        $user = User::find($request->input('user.id'));
        $initialBalance = $user->balance;
        $finalBalance = $initialBalance - $request->input('deposit.amount');
        $user->decrement('balance', $request->input('deposit.amount'));
        $balanceLog = UserBalanceLog::create([
            'user_id'         => $user->id,
            'type'            => 'debit',
            'category'        => 'other',
            'amount'          => $request->input('deposit.amount'),
            'initial_balance' => $initialBalance,
            'final_balance'   => $finalBalance,
            'content_key'  => 'deposits:log.balance-reduction',
            'content_params'  => (object) [],
        ]);
        return redirect()->back()->with('responseSuccess', 'Saldo berhasil dikurangi.');
    }
}

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('user.access')
                && $admin->hasRole('user.update');
        }

        return $admin->hasRole('user.access')
            && $admin->hasRole('user.create');
    }

    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        return [
            'user.group.id'  => ['required', 'exists:user_groups,id'],
            'user.full_name' => ['required', 'regex:/^[\pL\s\-]+$/u', Rule::unique('users', 'full_name')->ignore($id)],
            'user.whatsapp'  => ['required', 'numeric', Rule::unique('users', 'whatsapp')->ignore($id)],
            'user.email'     => ['required', 'email:rfc,dns', Rule::unique('users', 'email')->ignore($id)],
            'user.username'  => ['required', 'alpha_num:ascii', Rule::unique('users', 'username')->ignore($id)],
            'user.password'  => $id === null ? [
                'required',
                'regex:/^[\w\d\p{P}\p{S}]+$/u',
                'min:8',
                'max:20'
            ] : ['nullable'],
            'user.service_discount'  => [
                'required',
                'numeric',
                'integer',
                'min:0',
                'max:100'
            ],
        ];
    }

    public function attributes()
    {
        return [
            'user.group.id'  => __('common.labels.group'),
            'user.full_name' => __('common.labels.full_name'),
            'user.whatsapp'  => __('common.labels.whatsapp'),
            'user.email'     => __('common.labels.email'),
            'user.username'  => __('common.labels.username'),
            'user.password'  => __('common.labels.password'),
            'user.service_discount'  => __('admin/common.labels.service_discount'),
        ];
    }

    // protected function getValidatorInstance()
    // {
    //     $instance = parent::getValidatorInstance();
    //     if ($instance->fails() == true) {
    //         throw new HttpResponseException(response()->json([
    //             'status'  => false,
    //             'type'    => 'validation',
    //             'message' => parent::getValidatorInstance()->errors()
    //         ]));
    //     }
    //     return parent::getValidatorInstance();
    // }
}

class BalanceReductionRequest extends FormRequest
{
    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        return [
            'user.id'        => ['required', 'exists:users,id'],
            'deposit.amount' => [
                'required',
                'numeric',
            ],
        ];
    }

    public function attributes()
    {
        return [
            'user.id'        => 'Pengguna',
            'deposit.amount' => 'Jumlah',
        ];
    }
}

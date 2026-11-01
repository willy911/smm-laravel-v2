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

use Exception;
use Inertia\Inertia;
use App\Models\Admin\Admin;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\User\UserGroup;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class GroupController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update']),
        ];
    }

    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('user.group.access'), 403);
        if ($request->has('page')) {
            $tableItems = UserGroup::withTrashed()->when($request->input(), function ($query) use ($request) {
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
                if ($request->input('filter.search')) {
                    $query->whereAny([
                        'id',
                        'name',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                $item->setVisible([]);
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('admin/user/group/index', [
            'pageProps' => Inertia::defer(
                fn() => []
            )
        ]);
    }

    public function store(UserGroupRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('user.group.create'), 403);
        $credentials = [
            'name'            => escape_input($request->input('user.group.name')),
            'minimum_deposit' => escape_input($request->input('user.group.minimum_deposit')),
            'is_api_access_enabled' => $request->boolean('user.group.is_api_access_enabled'),
        ];
        $insertData = UserGroup::create($credentials);
        $insertActivityLog =  AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.create-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.user, common:labels.group',
                'id' => $insertData->id,
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.create_successful', [
                'item' => __('common.labels.group'),
                'id' => $insertData->id,
            ]),
        ]);
    }

    public function update(UserGroup $target, UserGroupRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('user.group.update'), 403);
        $credentials = [
            'name'            => escape_input($request->input('user.group.name')),
            'minimum_deposit' => escape_input($request->input('user.group.minimum_deposit')),
            'is_api_access_enabled' => $request->boolean('user.group.is_api_access_enabled'),
        ];
        $updateData = $target->update($credentials);
        if ($target->wasChanged()) {
            $insertActivityLog = AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content_key'  => 'admin/common:log.update-successful',
                'content_params'  => (object) [
                    'item' => 'common:labels.user, common:labels.group',
                    'id' => $target->id,
                ],
                'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
            ]);
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.update_successful', [
                'item' => __('common.labels.group'),
                'id' => $target->id,
            ]),
        ]);
    }

    public function action($action, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('user.group.delete'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        if ($action === 'trash') $targets = UserGroup::whereIn('id', $ids)->withoutTrashed()->get();
        if (in_array($action, ['restore', 'destroy'])) {
            $targets = UserGroup::whereIn('id', $ids)->onlyTrashed()->get();
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
                                    'item' => 'common:labels.user, common:labels.group',
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
                                    'item' => 'common:labels.user, common:labels.group',
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
                                    'item' => 'common:labels.user, common:labels.group',
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
                'item' => __('common.labels.group'),
                'id' => implode(', ', $ids),
            ]),
        ]);
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('user.group.update'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        $targets = UserGroup::whereIn('id', $ids)->get();
        if ($targets->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => __('common.empty.no_data_found'),
            ], 404);
        }
        foreach ($targets as $target) {
            if ($columnName == 'is_api_access_enabled') {
                $columnNameLabel = 'is_api_access_enabled';
                $from = $target->is_api_access_enabled;
            }
            if ($from != $columnValue) {
                $target->update([$columnName => $columnValue]);
                AdminActivityLog::create([
                    'admin_id'   => auth('admin')->user()->id,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->header('User-Agent'),
                    'content_key'  => 'admin/common:log.switch-successful',
                    'content_params'  => (object) [
                        'item' => 'common:labels.user, common:labels.group',
                        'id' => $target->id,
                        'column' => 'admin/common:labels.' . $columnNameLabel,
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
                'item' => __('common.labels.group'),
                'id' => implode(', ', $ids),
                'column' => __('admin/common.labels.' . $columnNameLabel),
            ]),
        ]);
    }
}

class UserGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('user.group.access')
                && $admin->hasRole('user.group.update');
        }

        return $admin->hasRole('user.group.access')
            && $admin->hasRole('user.group.create');
    }
    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        return [
            'user.group.name'            => ['required', Rule::unique('user_groups', 'name')->ignore($id)],
            'user.group.minimum_deposit' => [
                'required',
                'numeric',
                'min:0'
            ],
        ];
    }

    public function attributes()
    {
        return [
            'user.group.name'  => __('common.labels.name'),
            'user.group.minimum_deposit'  => __('common.labels.min_deposit'),
        ];
    }
}

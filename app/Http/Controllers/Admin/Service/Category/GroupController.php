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

namespace App\Http\Controllers\Admin\Service\Category;

use Exception;
use Inertia\Inertia;
use App\Models\Admin\Admin;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\Service\ServiceCategoryGroup;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Services\Admin\Service\CategoryGroupService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Storage;

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
        abort_unless(auth('admin')->user()->hasRole('service.category_group.access'), 403);
        if ($request->has('page')) {
            $tableItems = ServiceCategoryGroup::withTrashed()->when($request->input(), function ($query) use ($request) {
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
                $item->setHidden([]);
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('admin/service/category/group/index', [
            'pageProps' => Inertia::defer(
                fn() => []
            )
        ]);
    }

    public function store(ServiceCategoryGroupRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.category_group.create'), 403);
        $credentials = [
            'name'  => $request->input('service.category.group.name'),
            'slug'  => Str::slug($request->input('service.category.group.name')),
            'type'  => escape_input($request->input('service.category.group.type')),
            'icon'  => escape_input($request->input('service.category.group.icon')),
            'emoji' => escape_input($request->input('service.category.group.emoji')),
        ];
        if ($request->hasFile('service.category.group.image')) {
            $file = $request->file('service.category.group.image');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            Storage::disk('r2')->putFileAs('service-category-groups', $file, $filename);
            $credentials['image'] = $filename;
        }
        $insertData = ServiceCategoryGroup::create($credentials);
        $insertActivityLog =  AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.create-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.service, common:labels.group',
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

    public function update(ServiceCategoryGroup $target, ServiceCategoryGroupRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.category_group.update'), 403);
        $credentials = [
            'name'  => $request->input('service.category.group.name'),
            'slug'  => Str::slug($request->input('service.category.group.name')),
            'type'  => escape_input($request->input('service.category.group.type')),
            'icon'  => escape_input($request->input('service.category.group.icon')),
            'emoji' => escape_input($request->input('service.category.group.emoji')),
        ];
        if ($request->hasFile('service.category.group.image')) {
            $file = $request->file('service.category.group.image');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            Storage::disk('r2')->putFileAs('service-category-groups', $file, $filename);
            $credentials['image'] = $filename;
        }
        $updateData = $target->update($credentials);
        if ($target->wasChanged()) {
            $insertActivityLog = AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content_key'  => 'admin/common:log.update-successful',
                'content_params'  => (object) [
                    'item' => 'common:labels.service, common:labels.group',
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
        abort_unless(auth('admin')->user()->hasRole('service.category_group.delete'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        if ($action === 'trash') $targets = ServiceCategoryGroup::whereIn('id', $ids)->withoutTrashed()->get();
        if (in_array($action, ['restore', 'destroy'])) {
            $targets = ServiceCategoryGroup::whereIn('id', $ids)->onlyTrashed()->get();
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
                                    'item' => 'common:labels.service, common:labels.group',
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
                                    'item' => 'common:labels.service, common:labels.group',
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
                                    'item' => 'common:labels.service, common:labels.group',
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

    public function options(CategoryGroupService $serviceCategoryGroupService)
    {
        $items = collect($serviceCategoryGroupService->getOptions());
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
        abort_unless(auth('admin')->user()->hasRole('service.category_group.update'), 403);
        foreach ($request->input('items') as $index => $item) {
            ServiceCategoryGroup::whereId($item['value'])->update([
                'sort_number' => $index + 1
            ]);
        }
        $insertActivityLog = AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.sort-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.service, common:labels.group',
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.sort_successful', [
                'item' => __('common.labels.group'),
            ]),
        ]);
    }
}

class ServiceCategoryGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('service.category_group.access')
                && $admin->hasRole('service.category_group.update');
        }

        return $admin->hasRole('service.category_group.access')
            && $admin->hasRole('service.category_group.create');
    }

    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        return [
            'service.category.group.name'  => ['required', Rule::unique('service_category_groups', 'name')->ignore($id)],
            'service.category.group.type'  => ['required', 'in:emoji,icon,image'],
            'service.category.group.icon'  => ['required_if:service.category.group.type,icon'],
            'service.category.group.emoji' => ['required_if:service.category.group.type,emoji'],
            'service.category.group.image' => [
                ...$this->isPrecognitive()
                    ? []
                    : (
                        $request->input('service.category.group.type') === 'image'
                        ? array_filter([
                            !$id ? 'required' : null,
                            $request->hasFile('service.category.group.image')
                                ? 'mimes:jpeg,png,jpg,webp,svg,avif'
                                : null,
                            $request->hasFile('service.category.group.image')
                                ? 'max:5048'
                                : null,
                        ])
                        : ['nullable']
                    ),
            ],
        ];
    }

    public function attributes()
    {
        return [
            'service.category.group.name'  => __('common.labels.name'),
            'service.category.group.type'  => __('common.labels.type'),
            'service.category.group.icon'  => __('common.labels.icon'),
            'service.category.group.emoji' => __('common.labels.emoji'),
            'service.category.group.image' => __('common.labels.image'),
        ];
    }
}

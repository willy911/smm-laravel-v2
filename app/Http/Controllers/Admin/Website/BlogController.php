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

namespace App\Http\Controllers\Admin\Website;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\Website\WebsiteBlog;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Services\Admin\Website\BlogService;
use Exception;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BlogController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update']),
        ];
    }

    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('site.blog.access'), 403);
        if ($request->has('page')) {
            $tableItems = WebsiteBlog::withTrashed()->when($request->input(), function ($query) use ($request) {
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
                        'category',
                        'title',
                        'content',
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
        return inertia('admin/website/blog/index', [
            'pageProps' => Inertia::defer(
                fn() => []
            )
        ]);
    }

    public function create()
    {
        abort_unless(auth('admin')->user()->hasRole('site.blog.create'), 403);
        return inertia('Admin/Website/Blog/Form', [
            'pageProps' => [
                'target'      => new WebsiteBlog(),
            ]
        ]);
    }

    public function store(WebsiteBlogRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('site.blog.create'), 403);
        $credentials = [
            'tags'      => $request->input('website.blog.tags'),
            'category'  => $request->input('website.blog.category'),
            'title'     => $request->input('website.blog.title'),
            'slug'      => Str::slug($request->input('website.blog.title')),
            'content'   => $request->input('website.blog.content'),
            'is_public' => $request->boolean('website.blog.is_public') ? '1' : '0',
        ];

        if ($request->hasFile('website.blog.banner')) {
            $file = $request->file('website.blog.banner');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            Storage::disk('r2')->putFileAs('website-blogs', $file, $filename);
            $credentials['banner'] = $filename;
        }

        $insertData = WebsiteBlog::create($credentials);
        $insertActivityLog =  AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.create_successful',
            'content_params'  => (object) [
                'item' => 'common:labels.blog',
                'id' => $insertData->id,
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.create_successful', [
                'item' => __('common.labels.blog'),
                'id' => $insertData->id,
            ]),
        ]);
    }

    public function update(WebsiteBlog $target, WebsiteBlogRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('site.blog.update'), 403);
        $credentials = [
            'tags'      => $request->input('website.blog.tags'),
            'category'  => $request->input('website.blog.category'),
            'title'     => $request->input('website.blog.title'),
            'slug'      => Str::slug($request->input('website.blog.title')),
            'content'   => $request->input('website.blog.content'),
            'is_public' => $request->boolean('website.blog.is_public') ? '1' : '0',
        ];

        if ($request->hasFile('website.blog.banner')) {
            $file = $request->file('website.blog.banner');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            Storage::disk('r2')->putFileAs('website-blogs', $file, $filename);
            $credentials['banner'] = $filename;
        }

        $updateData = $target->update($credentials);
        if ($target->wasChanged()) {
            $insertActivityLog = AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content_key'  => 'admin/common:log.update_successful',
                'content_params'  => (object) [
                    'item' => 'common:labels.blog',
                    'id' => $target->id,
                ],
                'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
            ]);
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.update_successful', [
                'item' => __('common.labels.blog'),
                'id' => $target->id,
            ]),
        ]);
    }

    public function action($action, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('site.blog.delete'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        if ($action === 'trash') $targets = WebsiteBlog::whereIn('id', $ids)->withoutTrashed()->get();
        if (in_array($action, ['restore', 'destroy'])) {
            $targets = WebsiteBlog::whereIn('id', $ids)->onlyTrashed()->get();
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
                                'content_key'  => 'admin/common:log.trash_successful',
                                'content_params'  => (object) [
                                    'item' => 'common:labels.blog',
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
                                'content_key'  => 'admin/common:log.restore_successful',
                                'content_params'  => (object) [
                                    'item' => 'common:labels.blog',
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
                                'content_key'  => 'admin/common:log.destroy_successful',
                                'content_params'  => (object) [
                                    'item' => 'common:labels.blog',
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
                'item' => __('common.labels.blog'),
                'id' => implode(', ', $ids),
            ]),
        ]);
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('site.blog.update'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        $targets = WebsiteBlog::whereIn('id', $ids)->get();
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
                    'content_key'  => 'admin/common:log.switch_successful',
                    'content_params'  => (object) [
                        'item' => 'common:labels.blog',
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
                'item' => __('common.labels.blog'),
                'id' => implode(', ', $ids),
                'column' => __('common.labels.' . $columnNameLabel . ''),
            ]),
        ]);
    }

    public function options(Request $request, BlogService $blogService)
    {
        $items = collect($blogService->getOptions());
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
        abort_unless(auth('admin')->user()->hasRole('site.blog.update'), 403);
        foreach ($request->input('items') as $index => $item) {
            WebsiteBlog::whereId($item['value'])->update([
                'sort_number' => $index + 1
            ]);
        }
        $insertActivityLog = AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.sort-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.blog',
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.sort_successful', [
                'item' => __('common.labels.blog'),
            ]),
        ]);
    }
}

class WebsiteBlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('site.blog.access')
                && $admin->hasRole('site.blog.update');
        }

        return $admin->hasRole('site.blog.access')
            && $admin->hasRole('site.blog.create');
    }

    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        return [
            'website.blog.banner' => [
                ...$this->isPrecognitive() ? [] : [
                    (!$id ? 'required' : 'nullable'),
                ],
            ],
            'website.blog.category' => ['required'],
            'website.blog.tags' => ['required'],
            // 'website.blog.title'    => ['required', Rule::unique('website_blogs', 'title')->ignore($id)],
            'website.blog.title'    => ['required'],
            'website.blog.content'  => ['required'],
        ];
    }

    public function attributes()
    {
        return [
            'website.blog.title'   => __('common.labels.title'),
            'website.blog.content' => __('common.labels.content'),
            'website.blog.banner'  => __('common.labels.banner'),
            'website.blog.category'  => __('common.labels.category'),
            'website.blog.tags'  => __('blogs.labels.tags'),
        ];
    }
}

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

use Exception;
use Inertia\Inertia;
use App\Models\Admin\Admin;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Models\Product\ProductCategory;
use App\Models\Website\WebsiteNews;
use App\Services\Admin\PaymentMethodService;
use App\Services\Admin\Product\CategoryGroupService;
use App\Services\Admin\Website\NewsService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update']),
        ];
    }

    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('site.news.access'), 403);
        if ($request->has('page')) {
            $tableItems = WebsiteNews::withTrashed()->when($request->input(), function ($query) use ($request) {
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
        return inertia('admin/website/news/index', [
            'pageProps' => Inertia::defer(
                fn() => []
            )
        ]);
    }

    public function store(WebsiteNewsRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('site.news.create'), 403);
        $credentials = [
            'title'           => escape_input($request->input('website.news.title')),
            'slug'            => Str::slug($request->input('website.news.title')),
            'content'         => $request->input('website.news.content'),
            'only_visible_on' => $request->input('website.news.only_visible_on'),
            'is_public'       => $request->boolean('website.news.is_public'),
            'is_popup'        => $request->boolean('website.news.is_popup'),
        ];

        if ($request->hasFile('website.news.banner')) {
            $file = $request->file('website.news.banner');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            Storage::disk('r2')->putFileAs('website-news', $file, $filename);
            $credentials['banner'] = $filename;
        }

        $insertData = WebsiteNews::create($credentials);
        $insertActivityLog =  AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.create-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.news',
                'id' => $insertData->id,
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.create_successful', [
                'item' => __('common.labels.news'),
                'id' => $insertData->id,
            ]),
        ]);
    }

    public function update(WebsiteNews $target, WebsiteNewsRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('site.news.update'), 403);
        $credentials = [
            'title'           => escape_input($request->input('website.news.title')),
            'slug'            => Str::slug($request->input('website.news.title')),
            'content'         => $request->input('website.news.content'),
            'only_visible_on' => $request->input('website.news.only_visible_on'),
            'is_public'       => $request->boolean('website.news.is_public'),
            'is_popup'        => $request->boolean('website.news.is_popup'),
        ];

        if ($request->hasFile('website.news.banner')) {
            $file = $request->file('website.news.banner');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            Storage::disk('r2')->putFileAs('website-news', $file, $filename);
            $credentials['banner'] = $filename;
        }

        $updateData = $target->update($credentials);
        if ($target->wasChanged()) {
            $insertActivityLog = AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content_key'  => 'admin/common:log.update-successful',
                'content_params'  => (object) [
                    'item' => 'common:labels.news',
                    'id' => $target->id,
                ],
                'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
            ]);
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.update_successful', [
                'item' => __('common.labels.news'),
                'id' => $target->id,
            ]),
        ]);
    }

    public function action($action, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('site.news.delete'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        if ($action === 'trash') $targets = WebsiteNews::whereIn('id', $ids)->withoutTrashed()->get();
        if (in_array($action, ['restore', 'destroy'])) {
            $targets = WebsiteNews::whereIn('id', $ids)->onlyTrashed()->get();
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
                                    'item' => 'common:labels.news',
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
                                    'item' => 'common:labels.news',
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
                                    'item' => 'common:labels.news',
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
                'item' => __('common.labels.news'),
                'id' => implode(', ', $ids),
            ]),
        ]);
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('site.news.update'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        $targets = WebsiteNews::whereIn('id', $ids)->get();
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
                        'item' => 'common:labels.news',
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
                'item' => __('common.labels.news'),
                'id' => implode(', ', $ids),
                'column' => __('common.labels.' . $columnNameLabel . ''),
            ]),
        ]);
    }

    public function options(Request $request, NewsService $newsService)
    {
        $items = collect($newsService->getOptions());
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
        abort_unless(auth('admin')->user()->hasRole('site.news.update'), 403);
        foreach ($request->input('items') as $index => $item) {
            WebsiteNews::whereId($item['value'])->update([
                'sort_number' => $index + 1
            ]);
        }
        $insertActivityLog = AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.sort-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.news',
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.sort_successful', [
                'item' => __('common.labels.news'),
            ]),
        ]);
    }
}

class WebsiteNewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('site.news.access')
                && $admin->hasRole('site.news.update');
        }

        return $admin->hasRole('site.news.access')
            && $admin->hasRole('site.news.create');
    }

    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        return [
            'website.news.title'    => ['required', Rule::unique('website_news', 'title')->ignore($id)],
            'website.news.content'  => ['required'],
            // 'website.news.banner' => [
            //     ...$this->isPrecognitive() ? [] : [
            //         (!$id ? 'required' : 'nullable'),
            //     ],
            // ],
        ];
    }

    public function attributes()
    {
        return [
            'website.news.title'   => __('common.labels.title'),
            'website.news.content' => __('common.labels.content'),
            'website.news.banner'  => __('common.labels.banner'),
        ];
    }
}

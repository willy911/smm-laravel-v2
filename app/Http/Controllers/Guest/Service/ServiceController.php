<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott  
| * Whatsapp : https://wa.me/6285349680016  
| * Telegram : https://t.me/jhondelton   
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

namespace App\Http\Controllers\Guest\Service;

use App\Http\Controllers\Controller;
use App\Models\Service\Service;
use App\Models\Service\ServiceCategory;
use Illuminate\Http\Request;
use App\Models\Service\ServiceCategoryGroup;
use Carbon\Carbon;
use App\Enums\Service\Service as ServiceEnum;
use App\Models\Service\ServiceFavorite;
use App\Tables\Guest\Page\Service\Service as ServiceTable;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Enums\Service\ServiceUpdate as ServiceUpdateEnum;
use App\Services\General\Service\CategoryService;
use Illuminate\Support\Facades\RateLimiter;

class ServiceController extends Controller
{
    public function __invoke(Request $request, CategoryService $categoryService)
    {
        if ($request->has('page')) {
            if (RateLimiter::tooManyAttempts($rateKey = 'render-table' . ':' . $request->ip(), 5)) {
                $seconds = RateLimiter::availableIn($rateKey);
                return response()->json([
                    'status'  => false,
                    'message' => __('common.toast.throttle', ['seconds' => $seconds]),
                ], 429);
            }
            // RateLimiter::hit($rateKey);
            $orderColumn = $request->input('order.column') === 'category'
                ? ServiceCategory::select('name')->whereColumn('service_categories.id', 'services.service_category_id')
                : $request->input('order.column');
            $orderDirection = $request->input('order.direction') === 'asc' ? 'asc' : 'desc';
            $tableItems = Service::with([
                'serviceCategory',
                'orders' => fn($query) => $query->select('id', 'service_id', 'quantity', 'created_at', 'updated_at')->where('status', 'completed')->latest('id')->limit(10),
                'serviceUpdates' => fn($query) => $query->latest('id')->limit(1),
                'serviceFavorites' => function ($query) {
                    if (auth()->check()) {
                        $query->where('user_id', auth()->id());
                    }
                },
                'serviceCustomPrice',
            ])->where('status', '1')->when($request->input(), function ($query) use ($request) {
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
                if ($request->filled('filter.service_category_id')) {
                    $query->whereIn('service_category_id', explode(',', $request->input('filter.service_category_id')));
                }
                if ($request->filled('filter.service_category_group_id')) {
                    $query->whereHas('serviceCategory', function ($query) use ($request) {
                        $query->whereIn('service_category_group_id', explode(',', $request->input('filter.service_category_group_id')));
                    });
                }
                if ($request->filled('filter.type')) {
                    $query->whereIn('type', explode(',', $request->input('filter.type')));
                }
                if ($request->filled('filter.other')) {
                    $filters = array_map('trim', explode(',', $request->input('filter.other')));
                    foreach ($filters as $filter) {
                        match ($filter) {
                            'custom_price' => auth()->check()
                                ? $query->whereHas('serviceCustomPrice')
                                : null,
                            'favorite' => auth()->check()
                                ? $query->whereHas(
                                    'serviceFavorites',
                                    fn($q) => $q->where('user_id', auth()->id())
                                )
                                : null,
                            'recommended' => $query->where('is_recommended', '1'),
                            'best_seller' => $query->where('is_best_seller', '1'),
                            'refill' => $query->where('is_refill_support', '1'),
                            'cancel' => $query->where('is_cancel_support', '1'),
                            default => null,
                        };
                    }
                }
                if ($request->filled('filter.search')) {
                    $query->whereAny([
                        'id',
                        'name',
                        'description',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($orderColumn, $orderDirection)
                ->withCount(['orderReviews as total_ratings' => function ($query) {
                    $query->where('status', '1');
                }])
                ->withAvg(['orderReviews as avg_ratings' => function ($query) {
                    $query->where('status', '1');
                }], 'rating')
                ->paginate($request->input('length') ?: 30)->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                $item->avg_quantity = $item->get_avg_quantity;
                $item->avg_time = $item->get_avg_time;
                $item->is_favorite = $item->serviceFavorites->isNotEmpty();
                $item->service_update = $item->serviceUpdates->first();
                if ($item->serviceCustomPrice) {
                    $item->price = $item
                        ->serviceCustomPrice
                        ->price_configs
                        ->price;
                }

                if (
                    auth()->check() &&
                    auth()->user()->service_discount > 0
                ) {
                    $item->price -= (
                        $item->price *
                        (auth()->user()->service_discount / 100)
                    );
                }
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('guest/service/index', [
            'pageProps' => Inertia::defer(
                function () use ($categoryService) {
                    $othersCounts = Service::selectRaw('
                        COUNT(*) as total,
                        COUNT(IF(is_recommended = 1, 1, NULL)) as recommended_count,
                        COUNT(IF(is_best_seller = 1, 1, NULL)) as best_seller_count,
                        COUNT(IF(is_refill_support = 1, 1, NULL)) as refill_count,
                        COUNT(IF(is_cancel_support = 1, 1, NULL)) as cancel_count
                    ')->where('status', '1')->first();
                    return [
                        'serviceCategories' => [
                            'filters' => $categoryService->getFilters(),
                        ],
                        'serviceTypes' => Service::where('status', '1')
                            ->selectRaw('type, COUNT(*) as count')
                            ->groupBy('type')
                            ->get()
                            ->map(function ($row) {
                                return [
                                    'value' => $row->type,
                                    'label' => ServiceEnum::getValue('ARRAY_TYPE_LABELS')[$row->type],
                                    'count' => $row->count,
                                ];
                            }),
                        'serviceCategoryGroups' => ServiceCategoryGroup::orderByRaw('ISNULL(sort_number), sort_number ASC, id ASC')->get(['id', 'name', 'type', 'icon', 'emoji']),
                        'others' => array_values(array_filter([
                            auth()->check() ? [
                                'value' => 'favorite',
                                'label' => 'common:labels.my-favorite',
                                'count' => Service::where('status', '1')
                                    ->whereHas('serviceFavorites', fn($q) => $q->where('user_id', auth()->id()))
                                    ->count()
                            ] : null,
                            auth()->check() ? [
                                'value' => 'custom_price',
                                'label' => 'labels.custom-price',
                                'count' => Service::where('status', '1')
                                    ->whereHas('serviceCustomPrices', fn($q) => $q->where('user_group_id', auth()->user()->user_group_id))
                                    ->count()
                            ] : null,
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
}

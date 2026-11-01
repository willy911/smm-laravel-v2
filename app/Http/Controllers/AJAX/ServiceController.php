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

namespace App\Http\Controllers\AJAX;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Order\Order;
use App\Models\Order\OrderReview;
use App\Models\Service\Service;
use App\Models\Service\ServiceFavorite;
use App\Models\User\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;

class ServiceController extends Controller
{
    public function __construct(Request $request)
    {
        // if (!$request->ajax()) return abort('404');
    }

    public function index(Request $request)
    {
        $checkServices = $services = Service::with([
            'serviceFavorites' => function ($query) {
                if (auth()->check()) $query->where('user_id', auth()->id());
            },
            'serviceCustomPrice',
            'orders' => function ($query) {
                $query->select('id', 'service_id', 'quantity', 'created_at', 'updated_at')->where('status', 'completed')->latest('id')->limit(10);
            }
        ])->where('status', '1')->where('service_category_id', escape_input($request->input('service.category.id')))->when($request->input(), function ($query) use ($request) {
            if ($request->boolean('service.is_favorites')) {
                $query->whereHas('serviceFavorites', function ($query) {
                    if (auth()->check()) $query->where('user_id', auth()->id());
                });
            }
            if ($request->filled('order.type') && $request->input('order.type') == 'mass') {
                $query->where('type', 'primary');
            }
        })->orderByRaw('ISNULL(sort_number), sort_number ASC, price ASC')->get()->map(function ($row) {
            if ($row->serviceCustomPrice) {
                $row->serviceCustomPrice->price = $row->serviceCustomPrice->price_configs->price;
                if (
                    auth()->check() &&
                    auth()->user()->service_discount > 0
                ) {
                    $row->serviceCustomPrice->price -= (
                        $row->serviceCustomPrice
                        ->price_configs
                        ->price *
                        (auth()->user()->service_discount / 100)
                    );
                }
            }
            return [
                'value'   => $row->id,
                'label'   => '#' . $row->id . ' - ' . $row->name,
                'price'   => $row->price,
                'is_recommended' => $row->is_recommended,
                'is_best_seller' => $row->is_best_seller,
                'refill_days' => $row->refill_days,
                'is_refill_support' => $row->is_refill_support,
                'is_cancel_support' => $row->is_cancel_support,
                'min' => $row->min,
                'max' => $row->max,
                'type' => $row->type,
                'avg_time' => $row->get_avg_time,
                'avg_quantity' => $row->get_avg_quantity,
                'service_custom_price' => $row->serviceCustomPrice,
            ];
        });
        if ($checkServices->isEmpty()) return response()->json([
            'status'  => false,
            'message' => __('services.toast.no_services_found'),
        ]);
        return response()->json([
            'status'   => true,
            'services' => $services
        ]);
    }

    public function show(Service $target)
    {
        $target = Service::with(['serviceCategory', 'serviceCustomPrice', 'orders' => function ($query) {
            $query->where('status', 'completed')->latest('id')->limit(10);
        }])->firstWhere('id', $target->id);
        if ($target) {
            $target->avg_quantity = $target->get_avg_quantity;
            $target->avg_time = $target->get_avg_time;
            // $target->service_custom_prices = $target->serviceCustomPrices->map(function ($customPrice) use ($target) {
            //     $customPrice->price = $customPrice->price_configs->price;
            //     return $customPrice;
            // });
            if ($target->serviceCustomPrice) {
                $target->price = $target
                    ->serviceCustomPrice
                    ->price_configs
                    ->price;
            }

            if (
                auth()->check() &&
                auth()->user()->service_discount > 0
            ) {
                $target->price -= (
                    $target->price *
                    (auth()->user()->service_discount / 100)
                );
            }
        }
        $totalOrders = Order::where('service_id', $target->id)->count();

        $summary = Order::select(
            DB::raw("
                    CASE 
                        WHEN status IN ('partial', 'error', 'canceled') THEN 'failed' 
                        WHEN status IN ('processing', 'in_progress') THEN 'processing'
                        ELSE status 
                    END as custom_status
                "),
            DB::raw('COUNT(*) as count')
        )
            ->where('service_id', $target->id)
            ->groupBy('custom_status')
            ->get()
            ->mapWithKeys(function ($item) use ($totalOrders) {
                return [
                    $item->custom_status => [
                        'count' => $item->count,
                        'percentage' => $totalOrders > 0 ? round(($item->count / $totalOrders) * 100, 2) : 0
                    ]
                ];
            });

        $summary = [
            'total' => [
                'count' => $totalOrders
            ],
            'pending' => $summary['pending'] ?? ['count' => 0, 'percentage' => 0],
            'processing' => $summary['processing'] ?? ['count' => 0, 'percentage' => 0],
            'completed' => $summary['completed'] ?? ['count' => 0, 'percentage' => 0],
            'failed' => $summary['failed'] ?? ['count' => 0, 'percentage' => 0],
        ];

        $approvedReviewsQuery = OrderReview::where('service_id', $target->id)->where('status', '1');
        $target->total_ratings = (clone $approvedReviewsQuery)->count();
        $target->avg_ratings = round((float) ((clone $approvedReviewsQuery)->avg('rating') ?? 0), 2);

        $target->reviews = OrderReview::with('user:id,username')
            ->where('service_id', $target->id)
            ->where('status', '1')
            ->latest('id')
            ->limit(10)
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'message' => $review->message,
                    'created_at' => optional($review->created_at)->format('Y-m-d H:i:s'),
                    'user' => $review->user ? ['username' => $review->user->username] : null,
                ];
            })->values();

        if (auth()->check()) {
            $completedOrder = Order::where('user_id', auth()->id())
                ->where('service_id', $target->id)
                ->where('status', 'completed')
                ->orderByDesc('id')
                ->first();
            $hasReviewed = OrderReview::where('user_id', auth()->id())->where('service_id', $target->id)->exists();
            $target->can_review = (bool) ($completedOrder && ! $hasReviewed);
            $target->review_order_id = $completedOrder && ! $hasReviewed ? $completedOrder->id : null;
        } else {
            $target->can_review = false;
            $target->review_order_id = null;
        }

        return response()->json([
            'status'  => true,
            'service' => $target,
            'summary' => $summary,
        ]);
    }

    public function search(Request $request)
    {
        $checkServices = $services = Service::with('serviceCustomPrice')->where('status', '1')->whereHas('serviceCategory', function ($query) {
            $query->where('status', '1');
        })->whereAny([
            'id',
            'name',
        ], 'LIKE', '%' . escape_input($request->input('service.name')) . '%')->when($request->input(), function ($query) use ($request) {
            if ($request->boolean('service.is_favorites')) {
                $query->whereHas('serviceFavorites', function ($query) {
                    if (auth()->check()) $query->where('user_id', auth()->id());
                });
            }
            if ($request->filled('order.type') && $request->input('order.type') == 'mass') {
                $query->where('type', 'primary');
            }
        })->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')->limit(50)->get()->map(function ($row) {
            if ($row->serviceCustomPrice) {
                $row->price = $row
                    ->serviceCustomPrice
                    ->price_configs
                    ->price;
            }

            if (
                auth()->check() &&
                auth()->user()->service_discount > 0
            ) {
                $row->price -= (
                    $row->price *
                    (auth()->user()->service_discount / 100)
                );
            }
            return [
                'value'   => $row->id,
                'label'   => $row->id . ' - ' . $row->name . ' - ' . format_currency($row->price),
                'category_id'   => $row->service_category_id,
                'price'   => $row->price,
                'is_recommended' => $row->is_recommended,
                'is_popular' => $row->is_popular,
                'refill_days' => $row->refill_days,
                'is_refill_support' => $row->is_refill_support,
                'is_cancel_support' => $row->is_cancel_support,
                'min' => $row->min,
                'max' => $row->max,
            ];
        });
        if ($checkServices->isEmpty()) return response()->json([
            'status'   => false,
            'message' => __('services.toast.no_services_found'),
            'services' => []
        ]);
        return response()->json([
            'status'   => true,
            'services' => $services
        ]);
    }

    public function favorite($type, Request $request)
    {
        if (RateLimiter::tooManyAttempts($rateKey = 'action-favorite:' . auth()->id(), 5)) {
            $seconds = RateLimiter::availableIn($rateKey);
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.throttle', ['seconds' => $seconds]),
            ], 429);
        }
        RateLimiter::hit($rateKey);
        $serviceIds = $request->input('service_id', []);
        if (!is_array($serviceIds) || empty($serviceIds)) {
            RateLimiter::clear($rateKey);
            return response()->json([
                'status'  => false,
                'message' => __('services.toast.invalid_service_id'),
            ], 400);
        }
        $services = Service::whereIn('id', $serviceIds)->pluck('id');
        if ($type === 'add') {
            foreach ($services as $id) {
                ServiceFavorite::updateOrCreate([
                    'user_id'    => auth()->id(),
                    'service_id' => $id,
                ]);
            }
            return response()->json([
                'status'  => true,
                'message' => __('services.toast.added_to_favorites')
            ]);
        }
        ServiceFavorite::where('user_id', auth()->id())->whereIn('service_id', $services)->delete();
        return response()->json([
            'status'  => true,
            'message' => __('services.toast.removed_from_favorites')
        ]);
    }
}

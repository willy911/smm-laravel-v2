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

namespace App\Http\Controllers\User\Order;

use App\Http\Controllers\Controller;
use App\Models\Order\Order;
use App\Models\Order\OrderReview;
use App\Models\User\UserActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $user = auth('web')->user();
        abort_unless($user, 403);
        $request->validate([
            'order_id' => ['required', 'numeric', 'integer', 'exists:orders,id'],
            'rating'   => ['required', 'numeric', 'min:1', 'max:5'],
            'message'  => ['nullable', 'string', 'max:1000'],
        ]);
        $target = Order::where([
            'id'      => $request->input('order_id'),
            'user_id' => $user->id,
            'status'  => 'completed',
        ])->first();
        abort_if(!$target, 403);
        $checkServiceReviewed = OrderReview::where([
            'user_id'    => $user->id,
            'service_id' => $target->service_id,
        ])->exists();
        if ($checkServiceReviewed) {
            return response()->json([
                'status'  => false,
                'message' => __('orders.toast.already_reviewed'),
            ]);
        }
        if (RateLimiter::tooManyAttempts('order-review-create:' . $user->id, $perMinute = 1)) {
            $seconds = RateLimiter::availableIn('order-review-create:' . $user->id);
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.throttle', ['seconds' => $seconds]),
            ], 429);
        }
        RateLimiter::increment('order-review-create:' . $user->id);
        $insertOrderReview = OrderReview::create([
            'user_id'       => $user->id,
            'order_id'      => $target->id,
            'service_id'    => $target->service_id,
            'rating'        => $request->input('rating'),
            'message'       => $request->filled('message') ? escape_input($request->input('message')) : null,
            'status'        => '0',
            'is_read_admin' => '0',
        ]);
        if ($insertOrderReview == true) {
            $insertActivityLog = UserActivityLog::create([
                'user_id'        => $user->id,
                'ip_address'     => $request->ip(),
                'user_agent'     => $request->header('User-Agent'),
                'content_key'    => 'orders:log.review_successful',
                'content_params' => (object) ['order_id' => $target->id],
            ]);
            RateLimiter::clear('order-review-create:' . $user->id);
            return response()->json([
                'status'  => true,
                'message' => __('orders.toast.review_successful'),
            ]);
        }
        RateLimiter::clear('order-review-create:' . $user->id);
        return response()->json([
            'status'  => false,
            'message' => __('common.toast.exception'),
        ]);
    }
}

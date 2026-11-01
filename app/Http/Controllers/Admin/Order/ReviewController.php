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

namespace App\Http\Controllers\Admin\Order;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Models\Order\OrderReview;
use App\Models\Service\Service;
use App\Models\User\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);
        if ($request->has('page')) {
            $tableItems = OrderReview::withTrashed()->with(['user', 'service', 'order'])->when($request->input(), function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.user_id')) {
                    $query->whereIn('user_id', explode(',', $request->input('filter.user_id')));
                }
                if ($request->filled('filter.service_id')) {
                    $query->whereIn('service_id', explode(',', $request->input('filter.service_id')));
                }
                if ($request->filled('filter.status')) {
                    $query->whereIn('status', explode(',', $request->input('filter.status')));
                }
                if ($request->filled('filter.is_read_admin')) {
                    $query->whereIn('is_read_admin', explode(',', $request->input('filter.is_read_admin')));
                }
                if ($request->filled('filter.search')) {
                    $query->whereAny([
                        'id',
                        'order_id',
                        'service_id',
                        'user_id',
                        'rating',
                        'status',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length') ?: 30)->onEachSide(1);
            return response()->json([
                'status'  => true,
                'data'   => $tableItems,
            ]);
        }
        return inertia('admin/order/review/index', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'users' => User::whereHas('orderReviews')->withCount(['orderReviews'])->latest('id')->limit(100)->get()->map(function ($row) {
                        return [
                            'value'   => $row->id,
                            'label'   => $row->username,
                            'count'   => $row->order_reviews_count,
                        ];
                    }),
                    'services' => Service::whereHas('orderReviews')->withCount(['orderReviews'])->latest('id')->limit(100)->get()->map(function ($row) {
                        return [
                            'value'   => $row->id,
                            'label'   => $row->name,
                            'count'   => $row->order_reviews_count,
                        ];
                    }),
                ],
            )
        ]);
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(request()->ajax() && auth('admin')->user()->group->is_primary, 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.invalid_id'),
            ], 400);
        }
        $targets = OrderReview::withTrashed()->whereIn('id', $ids)->get();
        if ($targets->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => __('common.empty.no_data_found'),
            ], 404);
        }
        if (!in_array($columnName, ['status', 'is_read_admin']) || !in_array($columnValue, ['0', '1'])) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.invalid_input'),
            ], 400);
        }
        $columnNameLabel = 'status';
        if ($columnName == 'is_read_admin') {
            $columnNameLabel = 'is_read_admin';
        }
        foreach ($targets as $target) {
            $from = $target->{$columnName};
            if ($from != $columnValue) {
                $target->update([$columnName => $columnValue]);
                $insertActivityLog = AdminActivityLog::create([
                    'admin_id'   => auth('admin')->user()->id,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->header('User-Agent'),
                    'content_key'  => 'admin/common:log.switch-successful',
                    'content_params'  => (object) [
                        'item' => 'Ulasan',
                        'id' => $target->id,
                        'column' => $columnName,
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
                'item' => 'Ulasan',
                'id' => implode(', ', $ids),
                'column' => $columnNameLabel,
            ]),
        ]);
    }
}

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

namespace App\Http\Controllers\Admin\Service\Provider;

use App\Http\Controllers\Controller;
use App\Models\Service\ServiceProviderResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResponseController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);
        if ($request->has('page')) {
            $tableItems = ServiceProviderResponse::with(['user', 'service', 'serviceProvider', 'order', 'orderRefill', 'orderCancel'])->when($request->input(), function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.type')) {
                    $query->whereIn('type', explode(',', $request->input('filter.type')));
                }
                if ($request->filled('filter.status')) {
                    $query->whereIn('status', explode(',', $request->input('filter.status')));
                }
                if ($request->filled('filter.search')) {
                    $query->where(function ($query) use ($request) {
                        $query->whereAny([
                            'id',
                            'order_id',
                            'order_refill_id',
                            'order_cancel_id',
                            'service_id',
                            'service_provider_id',
                        ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                        $query->orWhereHas('user', function ($query) use ($request) {
                            $query->whereAny([
                                'username',
                                'full_name',
                            ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                        });
                        $query->orWhereHas('service', function ($query) use ($request) {
                            $query->whereAny([
                                'name',
                            ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                        });
                        $query->orWhereHas('serviceProvider', function ($query) use ($request) {
                            $query->whereAny([
                                'alias',
                            ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                        });
                        $query->orWhereHas('order', function ($query) use ($request) {
                            $query->whereAny([
                                'ref_id',
                            ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                        });
                        $query->orWhereHas('orderRefill', function ($query) use ($request) {
                            $query->whereAny([
                                'ref_id',
                            ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                        });
                        $query->orWhereHas('orderCancel', function ($cancelQuery) use ($request) {
                            $cancelQuery->whereAny([
                                'ref_id',
                            ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                        });
                    });
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length') ?: 30)->onEachSide(1);
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('admin/service/provider/response', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'types' => [
                        ['value' => 'account_profile', 'label' => __('admin/provider-response:labels.account_profile')],
                        ['value' => 'order_create', 'label' => __('admin/provider-response:labels.order_create')],
                        ['value' => 'order_status', 'label' => __('admin/provider-response:labels.order_status')],
                        ['value' => 'order_cancel_create', 'label' => __('admin/provider-response:labels.order_cancel_create')],
                        ['value' => 'order_refill_create', 'label' => __('admin/provider-response:labels.order_refill_create')],
                        ['value' => 'order_refill_status', 'label' => __('admin/provider-response:labels.order_refill_status')],
                        ['value' => 'fetch_services', 'label' => __('admin/provider-response:labels.fetch_services')],
                    ],
                    'statuses' => [
                        ['value' => 'success', 'label' => __('admin/provider-response:labels.success')],
                        ['value' => 'fail', 'label' => __('admin/provider-response:labels.fail')],
                    ],
                ],
            ),
        ]);
    }
}

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

namespace App\Http\Controllers\Admin\Log;

use Exception;
use Inertia\Inertia;
use App\Models\Admin\Admin;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Models\Admin\AdminSigninLog;
use App\Models\PaymentMethod;
use App\Models\Product\ProductCategory;
use App\Services\Admin\Admin\AdminService;
use App\Services\Admin\PaymentMethodService;
use App\Services\Admin\Product\CategoryGroupService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function signin(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('log.admin.signin.access'), 403);
        if ($request->has('page')) {
            $tableItems = AdminSigninLog::with('admin')->when($request->input(), function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.admin_id')) {
                    $query->whereIn('admin_id', explode(',', $request->input('filter.admin_id')));
                }
                if ($request->input('filter.search')) {
                    $query->whereAny([
                        'id',
                        'ip_address',
                        'user_agent',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        $adminService = new AdminService();
        return inertia('admin/log/admin/signin', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'admins' => [
                        'filters' => $adminService->getFilters('adminSigninLogs'),
                    ],
                ]
            )
        ]);
    }

    public function activity(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('log.admin.activity.access'), 403);
        if ($request->has('page')) {
            $tableItems = AdminActivityLog::with('admin')->when($request->input(), function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.admin_id')) {
                    $query->whereIn('admin_id', explode(',', $request->input('filter.admin_id')));
                }
                if ($request->input('filter.search')) {
                    $query->whereAny([
                        'id',
                        'content_key',
                        'content_params',
                        'updated_columns',
                        'ip_address',
                        'user_agent',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        $adminService = new AdminService();
        return inertia('admin/log/admin/activity', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'admins' => [
                        'filters' => $adminService->getFilters('adminActivityLogs'),
                    ],
                ]
            )
        ]);
    }
}

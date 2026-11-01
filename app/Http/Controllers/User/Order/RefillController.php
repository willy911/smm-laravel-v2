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
use App\Models\Service\ServiceProviderResponse;
use App\Models\User\UserActivityLog;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use App\Tables\User\OrderRefill as OrderRefillTable;
use App\Enums\Order\OrderRefill as OrderRefillEnum;
use App\Models\Order\OrderRefill;
use Carbon\CarbonInterval;
use Illuminate\Http\Client\Pool;
use Inertia\Inertia;

class RefillController extends Controller
{
    public function __invoke(Request $request)
    {
        if ($request->has('page')) {
            $tableItems = OrderRefill::where('user_id', auth()->id())->with(['service'])->withWhereHas('order')->when($request->input(), function ($query) use ($request) {
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
                if ($request->filled('filter.service_id')) {
                    $query->whereIn('service_id', explode(',', $request->input('filter.service_id')));
                }
                if ($request->filled('filter.status')) {
                    $query->whereIn('status', explode(',', $request->input('filter.status')));
                }
                if ($request->filled('filter.search')) {
                    $query->whereAny([
                        'id',
                        'order_id',
                        'service_id',
                        'status',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                $item->target = $item->order?->target;
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'   => $tableItems,
            ]);
        }
        return inertia('user/order/refill', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'services' => OrderRefill::withWhereHas('service')->where([
                        ['user_id', auth()->id()],
                    ])->select('service_id')->selectRaw('COUNT(*) as count')->groupBy('service_id')->latest('service_id')->limit(100)->get()->map(function ($row) {
                        return [
                            'value'   => $row->service_id,
                            'label'   => $row->service->name,
                            'count'   => $row->count,
                        ];
                    }),
                ],
            )
        ]);
    }
}

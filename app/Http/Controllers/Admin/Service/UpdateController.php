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

namespace App\Http\Controllers\Admin\Service;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Service\ServiceUpdate;
use Inertia\Inertia;

class UpdateController extends Controller
{

    public function __invoke(Request $request)
    {
        if ($request->has('page')) {
            $tableItems = ServiceUpdate::has('service')->with([
                'service',
            ])->when($request->input(), function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.type')) {
                    $query->whereIn('type', explode(',', $request->input('filter.type')));
                }
                if ($request->filled('filter.service_id')) {
                    $query->whereIn('service_id', explode(',', $request->input('filter.service_id')));
                }
                if ($request->filled('filter.search')) {
                    $query->whereAny([
                        'service_id',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                $item->id = $item->service_id;
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('admin/service/update', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'services' => ServiceUpdate::withWhereHas('service')->select('service_id')->selectRaw('COUNT(*) as count')->groupBy('service_id')->latest('service_id')->limit(100)->get()->map(function ($row) {
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

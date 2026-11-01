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

namespace App\Http\Controllers\User\Account\Log;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User\UserSigninLog;
use App\Tables\User\Account\Log\Signin as SigninTable;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SigninController extends Controller
{
    public function __invoke(Request $request)
    {
        if ($request->has('page')) {
            $tableItems = UserSigninLog::where('user_id', auth()->id())->when($request->input(), function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.search')) {
                    $query->where(function ($query) use ($request) {
                        $query->whereAny([
                            'ip_address',
                            'user_agent',
                        ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                    });
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            return response()->json([
                'status' => true,
                'data'   => $tableItems
            ]);
        }
        return inertia('user/account/log/signin', [
            'pageProps' => Inertia::defer(
                fn() => []
            )
        ]);
    }
}

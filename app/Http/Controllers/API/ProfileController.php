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

namespace App\Http\Controllers\API;

use App\Models\Deposit\Deposit;
use App\Models\Order\Order;
use App\Models\User\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Locale;

class ProfileController extends Controller
{

    public function __invoke(Request $request)
    {
        $checkUser = $user = User::whereJsonContains('api->api_key', $request->input('api_key'))->whereJsonContains('api->secret_key', $request->input('secret_key'))->first();
        $localeId = Locale::find(1);
        return response()->json([
            'status' => true,
            'data'   => [
                'username'  => $user->username,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'whatsapp' => $user->whatsapp,
                'balance' => round(
                    (float) $user->balance * $localeId->usd_rate,
                    (int) $localeId->max_decimal_digits
                ),
                'orders' => round(
                    Order::where([
                        ['user_id', $user->id],
                        ['status', 'completed']
                    ])->sum('price') * $localeId->usd_rate,
                    (int) $localeId->max_decimal_digits
                ),
                'deposits' => round(
                    Deposit::where([
                        ['user_id', $user->id],
                        ['status', 'success']
                    ])->sum('amount') * $localeId->usd_rate,
                    (int) $localeId->max_decimal_digits
                ),
                'joined_at'   => date('Y-m-d', strtotime($user->created_at)),
            ],
        ], 200, [], JSON_PRETTY_PRINT);
    }
}

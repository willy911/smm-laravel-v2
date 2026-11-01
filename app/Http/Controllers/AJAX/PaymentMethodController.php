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
use App\Models\Payment\PaymentMethod;
use App\Models\User\User;

class PaymentMethodController extends Controller
{
    public function __construct(Request $request)
    {
        // if (!$request->ajax()) return abort('404');
    }

    public function show(PaymentMethod $target)
    {
        return response()->json([
            'status'         => true,
            'payment_method' => $target
        ]);
    }
}

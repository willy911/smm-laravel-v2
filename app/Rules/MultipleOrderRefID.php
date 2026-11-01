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

namespace App\Rules;

use App\Models\Order\Order;
use App\Models\User\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MultipleOrderRefID implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (count(explode(',', str_replace(' ', '', escape_input($value)))) > 100) {
            $fail('- ID. Ref pesanan tidak boleh lebih dari 100.');
        }
        $checkUser = $user = User::whereJsonContains('api->api_key', request()->input('api_key'))->whereJsonContains('api->secret_key', request()->input('secret_key'))->first();
        $checkOrders = $orders = Order::where('user_id', $user->id)
            ->where(function ($query) use ($value) {
                $query->whereIn('id', explode(',', str_replace(' ', '', escape_input($value))));
            })
            ->get()->map(function ($row) {
                return [
                    'value'   => $row->id,
                ];
            });
        if ($checkOrders->isEmpty()) {
            $fail('- tidak ada pesanan ditemukan');
        }
    }
}

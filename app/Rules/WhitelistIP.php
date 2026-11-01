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

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class WhitelistIP implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        foreach (explode(',', $value) as $ip) {
            if (!filter_var(trim($ip), FILTER_VALIDATE_IP)) {
                $fail('- <b>:Attribute</b> harus berupa alamat IP yang valid.');
            }
        }
    }
}

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

use App\Models\Service\Service;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MassOrder implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $encountered = [];
        if (count(array_filter(explode("\n", $value), 'trim')) > 50) {
            $fail('- <b>:Attribute</b> tidak boleh lebih dari 50 baris.');
        }
        foreach (array_filter(explode("\n", $value), 'trim') as $line) {
            $inputs = explode(',', $line);
            if (count($inputs) <> 2) {
                $fail('- <b>:Attribute</b> must be in a valid format, for example: <b>username,100</b>.');
            }
            if (isset($inputs[1]) && !is_numeric($inputs[1])) {
                $fail('- <b>Jumlah</b> wajib berupa angka.');
            }
            if (isset($encountered[escape_input($inputs[0]) . ',' . ($inputs[1] ?? 0)])) {
                $fail('- <b>' . escape_input($inputs[0]) . ',' . $inputs[1] . '</b> sudah ada di daftar target & jumlah.');
            }
            $encountered[escape_input($inputs[0]) . ',' . ($inputs[1] ?? 0)] = true;
            if (request()->input('service.id') && isset($inputs[1]) && is_numeric($inputs[1])) {
                $checkService = $service = Service::find(request()->input('service.id'));
                if ($checkService && $inputs[1] < $service->min) {
                    $fail('- <b>Jumlah</b> minimal bernilai ' . $service->min . '.');
                }
                if ($checkService && $inputs[1] > $service->max) {
                    $fail('- <b>Jumlah</b> maksimal bernilai ' . $service->max . '.');
                }
            }
        }
    }
}

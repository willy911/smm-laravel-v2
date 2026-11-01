<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class UpdateBatchOrder implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $orderIds = request()->input('order.ids', []);
        $lines = array_values(array_filter(
            preg_split('/\r\n|\r|\n/', $value),
            fn($line) => trim($line) !== ''
        ));
        if (count($lines) !== count($orderIds)) {
            $fail('- <b>:Attribute</b> jumlah baris harus sama dengan jumlah order.');
            return;
        }
        foreach ($lines as $index => $line) {
            if (!ctype_digit(trim($line))) {
                $fail(
                    '- <b>:Attribute</b> baris ke-' . ($index + 1) .
                        ' wajib berisi angka saja.'
                );
                return;
            }
        }
    }
}

<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class UpdateBatchService implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $serviceIds = request()->input('service.ids', []);
        $lines = array_values(array_filter(
            preg_split('/\r\n|\r|\n/', $value),
            fn($line) => trim($line) !== ''
        ));
        if (count($lines) !== count($serviceIds)) {
            $fail('- <b>:Attribute</b> jumlah baris harus sama dengan jumlah service.');
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

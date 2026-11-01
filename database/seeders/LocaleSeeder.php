<?php

namespace Database\Seeders;

use App\Models\Locale;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LocaleSeeder extends Seeder
{
    public function run(): void
    {
        Locale::insert([
            [
                'currency_code'    => 'IDR',
                'currency_symbol'  => 'Rp',
                'language_name'    => 'Indonesian',
                'usd_rate'         => 17000,
                'locale'           => 'id',
                'locale_code'      => 'id-ID',
                'max_decimal_digits' => '0',
                'decimal_separator' => ',',
                'thousand_separator' => '.',
                'translations'     => json_encode([
                    'full_name'    => 'Rupiah Indonesia',
                    'short_name'   => 'IDR',
                    'amount_label' => 'Jumlah',
                ]),
            ],
            [
                'currency_code'    => 'USD',
                'currency_symbol'  => '$',
                'language_name'    => 'English',
                'usd_rate'         => 1,
                'locale'           => 'en',
                'locale_code'      => 'en-US',
                'max_decimal_digits' => '8',
                'decimal_separator' => '.',
                'thousand_separator' => ',',
                'translations'     => json_encode([
                    'full_name'    => 'United States Dollar',
                    'short_name'   => 'USD',
                    'amount_label' => 'Amount',
                ]),
            ],
            [
                'currency_code'    => 'RUB',
                'currency_symbol'  => '₽',
                'language_name'    => 'Russian',
                'usd_rate'         => 90,
                'locale'           => 'ru',
                'locale_code'      => 'ru-RU',
                'max_decimal_digits' => '4',
                'decimal_separator' => ',',
                'thousand_separator' => '.',
                'translations'     => json_encode([
                    'full_name'    => 'Rupiah Indonesia',
                    'short_name'   => 'IDR',
                    'amount_label' => 'Jumlah',
                ]),
            ],
            [
                'currency_code'    => 'INR',
                'currency_symbol'  => '₹',
                'language_name'    => 'Indian',
                'usd_rate'         => 90,
                'locale'           => 'hi',
                'locale_code'      => 'hi-IN',
                'max_decimal_digits' => '4',
                'decimal_separator' => '.',
                'thousand_separator' => ',',
                'translations'     => json_encode([
                    'full_name'    => 'Rupiah Indonesia',
                    'short_name'   => 'IDR',
                    'amount_label' => 'Jumlah',
                ]),
            ],
            [
                'currency_code'    => 'BRL',
                'currency_symbol'  => 'R$',
                'language_name'    => 'Portuguese / Brazil',
                'usd_rate'         => 5.30,
                'locale'           => 'pt',
                'locale_code'      => 'pt-BR',
                'max_decimal_digits' => '4',
                'decimal_separator' => ',',
                'thousand_separator' => '.',
                'translations'     => json_encode([
                    'full_name'    => 'Rupiah Indonesia',
                    'short_name'   => 'IDR',
                    'amount_label' => 'Jumlah',
                ]),
            ],
            [
                'currency_code'    => 'TRY',
                'currency_symbol'  => '₺',
                'language_name'    => 'Turkish',
                'usd_rate'         => 43.00,
                'locale'           => 'tr',
                'locale_code'      => 'tr-TR',
                'max_decimal_digits' => '2',
                'decimal_separator' => ',',
                'thousand_separator' => '.',
                'translations'     => json_encode([
                    'full_name'    => 'Rupiah Indonesia',
                    'short_name'   => 'IDR',
                    'amount_label' => 'Jumlah',
                ]),
            ],
            [
                'currency_code'    => 'SAR',
                'currency_symbol'  => 'ر.س',
                'language_name'    => 'Arabic',
                'usd_rate'         => 0.30,
                'locale'           => 'ar',
                'locale_code'      => 'ar-SA',
                'max_decimal_digits' => '2',
                'decimal_separator' => ',',
                'thousand_separator' => '.',
                'translations'     => json_encode([
                    'full_name'    => 'Rupiah Indonesia',
                    'short_name'   => 'IDR',
                    'amount_label' => 'Jumlah',
                ]),
            ],
            [
                'currency_code'    => 'EUR',
                'currency_symbol'  => '€',
                'language_name'    => 'Spanish',
                'usd_rate'         => 1.20,
                'locale'           => 'es',
                'locale_code'      => 'es-ES',
                'max_decimal_digits' => '2',
                'decimal_separator' => ',',
                'thousand_separator' => '.',
                'translations'     => json_encode([
                    'full_name'    => 'Rupiah Indonesia',
                    'short_name'   => 'IDR',
                    'amount_label' => 'Jumlah',
                ]),
            ],
            [
                'currency_code'    => 'EUR',
                'currency_symbol'  => '€',
                'language_name'    => 'German',
                'usd_rate'         => 1.20,
                'locale'           => 'de',
                'locale_code'      => 'de-DE',
                'max_decimal_digits' => '2',
                'decimal_separator' => ',',
                'thousand_separator' => '.',
                'translations'     => json_encode([
                    'full_name'    => 'Rupiah Indonesia',
                    'short_name'   => 'IDR',
                    'amount_label' => 'Jumlah',
                ]),
            ],
            [
                'currency_code'    => 'EUR',
                'currency_symbol'  => '€',
                'language_name'    => 'Italian',
                'usd_rate'         => 1.20,
                'locale'           => 'it',
                'locale_code'      => 'it-IT',
                'max_decimal_digits' => '2',
                'decimal_separator' => ',',
                'thousand_separator' => '.',
                'translations'     => json_encode([
                    'full_name'    => 'Rupiah Indonesia',
                    'short_name'   => 'IDR',
                    'amount_label' => 'Jumlah',
                ]),
            ],
        ]);
    }
}

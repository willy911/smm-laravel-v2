<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class Locale extends Model
{
    use HasFactory, SoftDeletes;
    public $timestamps = true;
    protected $guarded = [];
    protected $visible = [
        'currency_code',
        'currency_symbol',
        'language_name',
        'usd_rate',
        'locale',
        'locale_code',
        'max_decimal_digits',
        'thousand_separator',
        'decimal_separator',
    ];
    protected $casts = [
        'translations' => 'object',
        'max_decimal_digits' => 'int',
    ];

    public function serviceProviders()
    {
        return $this->hasMany('App\Models\Service\ServiceProvider');
    }

    public function admins()
    {
        return $this->hasMany('App\Models\Admin\Admin');
    }

    public function users()
    {
        return $this->hasMany('App\Models\User\User');
    }

    protected static function booted()
    {
        static::saved(function () {
            Cache::forget('locales');
        });

        static::deleted(function () {
            Cache::forget('locales');
        });
    }
}

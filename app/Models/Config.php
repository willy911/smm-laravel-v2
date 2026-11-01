<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Config extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $guarded = [];

    protected static function booted()
    {
        static::saved(function () {
            Cache::forget('configs');
        });

        static::deleted(function () {
            Cache::forget('configs');
        });
    }
}

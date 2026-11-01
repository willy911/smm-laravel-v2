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

namespace App\Models\Website;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class WebsiteNews extends Model
{
    use HasFactory, SoftDeletes;
    public $timestamps = true;
    protected $guarded = [];
    protected $hidden = [
        'id',
        'sort_number',
        'status',
        'updated_at',
        'deleted_at',
    ];

    protected static function booted()
    {
        static::saved(function () {
            Cache::forget('website_news');
        });

        static::deleted(function () {
            Cache::forget('website_news');
        });

        static::restored(function () {
            Cache::forget('website_news');
        });
    }
}

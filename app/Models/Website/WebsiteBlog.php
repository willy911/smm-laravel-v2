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

class WebsiteBlog extends Model
{
    use HasFactory, SoftDeletes;
    public $timestamps = false;
    protected $guarded = [];
    protected $hidden = [
        'id',
        'sort_number',
        'updated_at',
        'deleted_at',
    ];
    protected static function booted()
    {
        static::saved(function () {
            generate_sitemap_xml();
        });

        static::deleted(function () {
            generate_sitemap_xml();
        });

        static::restored(function () {
            generate_sitemap_xml();
        });
    }
}

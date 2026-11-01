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

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminActivityLog extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $guarded = [];
    protected $casts = [
        'content_params' => 'object',
        'updated_columns' => 'object',
    ];

    public function admin()
    {
        return $this->belongsTo('App\Models\Admin\Admin');
    }
}

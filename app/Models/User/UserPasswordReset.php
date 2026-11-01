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

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPasswordReset extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $guarded = [];

    public function getRouteKeyName()
    {
        return 'token'; // Pastikan token adalah kolom yang digunakan di database
    }

    public function user()
    {
        return $this->belongsTo('App\Models\User\User');
    }
}

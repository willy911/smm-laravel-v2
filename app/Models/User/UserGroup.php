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
use Illuminate\Database\Eloquent\SoftDeletes;

class UserGroup extends Model
{
    use HasFactory, SoftDeletes;
    public $timestamps = true;
    protected $guarded = [];
    protected $visible = [
        'name',
        'is_api_access_enabled',
        'minimum_deposit',
    ];
    protected $casts = [
        'is_api_access_enabled' => 'boolean',
    ];

    public function users()
    {
        return $this->hasMany('App\Models\User\User');
    }

    public function serviceCustomPrices()
    {
        return $this->hasMany('App\Models\Service\ServiceCustomPrice');
    }
}

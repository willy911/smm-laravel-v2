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

namespace App\Models\Service;

use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceProvider extends Model
{
    use HasFactory, SoftDeletes;
    public $timestamps = true;
    protected $guarded = [];
    // protected $casts = [
    //     'default_parameters' => AsArrayObject::class,
    // ];
    protected $casts = [
        'default_parameters' => 'object',
    ];

    public function locale()
    {
        return $this->belongsTo('App\Models\Locale');
    }

    public function serviceProviderServices()
    {
        return $this->hasMany('App\Models\Service\ServiceProviderService');
    }

    public function serviceProviderConfiguration()
    {
        return $this->hasOne('App\Models\Service\ServiceProviderConfiguration');
    }

    public function services()
    {
        return $this->hasMany('App\Models\Service\Service');
    }

    public function orders()
    {
        return $this->hasMany('App\Models\Order\Order');
    }
}

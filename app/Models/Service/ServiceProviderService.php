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

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ServiceProviderService extends Model
{
    use HasFactory;
    public $timestamps = true;
    protected $guarded = [];

    public function serviceProvider()
    {
        return $this->belongsTo('App\Models\Service\ServiceProvider');
    }

    public function service()
    {
        return $this->belongsTo(
            Service::class,
            'service_provider_service_id',
            'service_provider_service_id'
        )->whereColumn(
            'service_provider_services.service_provider_id',
            'services.service_provider_id'
        );
    }
}

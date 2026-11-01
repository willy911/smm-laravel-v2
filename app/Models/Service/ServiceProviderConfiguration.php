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

class ServiceProviderConfiguration extends Model
{
    use HasFactory;
    public $timestamps = true;
    protected $guarded = [];
    protected $casts = [
        'account_configuration'             => 'object',
        'services_configuration'            => 'object',
        'order_create_configuration'        => 'object',
        'order_status_configuration'        => 'object',
        'order_cancel_create_configuration' => 'object',
        'order_refill_create_configuration' => 'object',
        'order_refill_status_configuration' => 'object',
    ];

    public function serviceProvider()
    {
        return $this->belongsTo('App\Models\Service\ServiceProvider');
    }

    protected function servicesConfiguration(): Attribute
    {
        return new Attribute(
            get: fn(string $value) => json_decode($value),
        );
    }

    protected function orderCreateConfiguration(): Attribute
    {
        return new Attribute(
            get: fn(string $value) => json_decode($value),
        );
    }

    protected function orderRefillCreateConfiguration(): Attribute
    {
        return new Attribute(
            get: fn(string $value) => json_decode($value),
        );
    }

    protected function orderCancelCreateConfiguration(): Attribute
    {
        return new Attribute(
            get: fn(string $value) => json_decode($value),
        );
    }
}

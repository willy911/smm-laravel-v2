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

class ServiceProviderResponse extends Model
{
    use HasFactory;
    public $timestamps = true;
    protected $guarded = [];
    protected $casts = [
        'logs' => 'object',
    ];

    public function user()
    {
        return $this->belongsTo('App\Models\User\User');
    }

    public function service()
    {
        return $this->belongsTo('App\Models\Service\Service');
    }

    public function serviceProvider()
    {
        return $this->belongsTo('App\Models\Service\ServiceProvider');
    }

    public function order()
    {
        return $this->belongsTo('App\Models\Order\Order');
    }

    public function orderRefill()
    {
        return $this->belongsTo('App\Models\Order\OrderRefill');
    }

    public function orderCancel()
    {
        return $this->belongsTo('App\Models\Order\OrderCancel');
    }
}

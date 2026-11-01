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

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Enums\Order\OrderRefill as OrderRefillEnum;

class OrderRefill extends Model
{
    use HasFactory;
    public $timestamps = true;
    protected $guarded = [];
    // protected $appends = ['status_classes'];
    protected $visible = [
        'target',
        'service',
        'order_id',
        'id',
        'status',
        'created_at',
        'updated_at',
    ];
    protected $casts = [
        'service_provider_order_refill_log' => 'object',
    ];

    public function user()
    {
        return $this->belongsTo('App\Models\User\User');
    }

    public function order()
    {
        return $this->belongsTo('App\Models\Order\Order');
    }

    public function service()
    {
        return $this->belongsTo('App\Models\Service\Service');
    }

    protected function target(): Attribute
    {
        return new Attribute(
            get: fn() => $this->order?->target,
        );
    }
}

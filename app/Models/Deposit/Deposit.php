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

namespace App\Models\Deposit;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\Deposit\Deposit as DepositEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Deposit extends Model
{
    use HasFactory;
    public $timestamps = true;
    protected $guarded = [];
    // protected $appends = ['status_classes'];
    protected $casts = [
        'payment_gateway_api_log' => 'object',
        'kurs_rate' => 'float',
        // 'payment_information' => 'array',
    ];
    protected $hidden = [
        'user_id',
        'payment_method_id',
        'payment_gateway_payment_id',
        'payment_gateway_payment_token',
        'payment_gateway_api_log',
        'deleted_at',
    ];

    public function resolveRouteBinding($value, $field = null)
    {
        $route = request()->route();
        $prefix = $route ? explode('.', $route->getName())[0] : null;
        $query = $this->where('id', $value);
        if ($prefix === 'user') {
            $query->where('user_id', auth()->id());
        }
        return $query->firstOrFail();
    }

    public function paymentMethod()
    {
        return $this->belongsTo('App\Models\PaymentMethod');
    }

    public function user()
    {
        return $this->belongsTo('App\Models\User\User');
    }

    protected function statusClasses(): Attribute
    {
        return new Attribute(
            get: fn() => DepositEnum::getValue('ARRAY_STATUS_CLASSES'),
        );
    }
}

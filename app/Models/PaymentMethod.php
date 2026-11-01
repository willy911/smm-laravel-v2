<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot | v1.0
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott  
| * Whatsapp : https://wa.me/6285349680016  
| * Telegram : https://t.me/jhondelton   
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\PaymentMethod\PaymentMethod as PaymentMethodEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;

class PaymentMethod extends Model
{
    use HasFactory, SoftDeletes;
    public $timestamps = true;
    protected $guarded = [];
    // protected $appends = ['status_classes'];
    protected $hidden = [
        'id',
        'sort_number',
        'payment_gateway',
        'show_for',
        'payment_gateway_payment_code',
        'user_information',
        'status',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'admin_fee_configs' => 'object',
        'bonus_configs' => 'object',
    ];

    public function imageLibrary()
    {
        return $this->belongsTo('App\Models\ImageLibrary');
    }

    public function orders()
    {
        return $this->hasMany('App\Models\Order\Order');
    }

    public function deposits()
    {
        return $this->hasMany('App\Models\Deposit\Deposit');
    }
}

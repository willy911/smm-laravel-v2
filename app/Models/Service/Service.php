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

use App\Enums\Service\Service as ServiceEnum;
use Carbon\CarbonInterval;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Cache;

class Service extends Model
{
    use HasFactory, SoftDeletes;
    public $timestamps = true;
    protected $guarded = [];
    protected $appends = ['type_labels'];
    protected $hidden = [
        'sort_number',
        'original_price',
        'profit',
        'service_provider_id',
        'service_provider_service_id',
        'orders',
        'serviceProvider',
        'serviceFavorites',
        'serviceUpdates',
        'settings',
        'status',
        'is_auto_update_price',
        'is_manual_profit',
        'refill_available_in_hours',
        'deleted_at',
    ];

    public function leaderboards()
    {
        return $this->hasMany('App\Models\Leaderboard');
    }

    public function order()
    {
        return $this->belongsTo('App\Models\Order\Order');
    }

    public function serviceProvider()
    {
        return $this->belongsTo('App\Models\Service\ServiceProvider');
    }

    public function serviceProviderService()
    {
        return $this->hasOne(
            ServiceProviderService::class,
            'service_provider_service_id',
            'service_provider_service_id'
        );
    }


    public function serviceCategory()
    {
        return $this->belongsTo('App\Models\Service\ServiceCategory');
    }

    public function serviceCustomPrice()
    {
        return $this->hasOne(ServiceCustomPrice::class)
            ->where(
                'user_group_id',
                auth()->user()->user_group_id ?? -1
            );
    }

    public function serviceCustomPrices()
    {
        return $this->hasMany('App\Models\Service\ServiceCustomPrice');
    }

    public function serviceFavorites()
    {
        return $this->hasMany('App\Models\Service\ServiceFavorite');
    }

    public function serviceRecommendation()
    {
        return $this->hasOne('App\Models\Service\ServiceRecommendation');
    }

    public function serviceUpdates()
    {
        return $this->hasMany('App\Models\Service\ServiceUpdate');
    }

    public function orders()
    {
        return $this->hasMany('App\Models\Order\Order', 'service_id');
    }

    public function orderRefills()
    {
        return $this->hasMany('App\Models\Order\OrderRefill');
    }

    public function orderCancels()
    {
        return $this->hasMany('App\Models\Order\OrderCancel');
    }

    public function orderReviews()
    {
        return $this->hasMany('App\Models\Order\OrderReview', 'service_id');
    }

    protected function getAvgQuantity(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('orders') && $this->orders->take(10)->avg('quantity') !== null
                ? ceil($this->orders->take(10)->avg('quantity'))
                : 0
        );
    }

    protected function getAvgTime(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('orders')
                ? (
                    $this->orders->take(10)->isEmpty()
                    ? 0
                    : $this->orders->take(10)->map(function ($order) {
                        return optional($order->created_at)->diffInSeconds($order->updated_at);
                    })->filter()->avg()
                )
                : null
        );
    }

    /**
     * Peta label tipe layanan (kunci enum => label), dikirim bersama setiap
     * baris service agar tabel admin bisa menampilkan kolom Tipe tanpa
     * melakukan hardcode mapping di frontend (mengikuti pola admin-smm:
     * $appends = ['type_labels'] + accessor typeLabels).
     */
    protected function typeLabels(): Attribute
    {
        return new Attribute(
            get: fn() => ServiceEnum::getValue('ARRAY_TYPE_LABELS'),
        );
    }

    protected static function booted()
    {
        static::saved(function () {
            Cache::forget('landing_page');
            Cache::forget('user_leaderboard');
        });

        static::deleted(function () {
            Cache::forget('landing_page');
            Cache::forget('user_leaderboard');
        });

        static::restored(function () {
            Cache::forget('landing_page');
            Cache::forget('user_leaderboard');
        });
    }
}

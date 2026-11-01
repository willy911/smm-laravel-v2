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
// use App\Enums\Order\Order as OrderEnum;
use App\Enums\Service\Service as ServiceEnum;
use Carbon\Carbon;
use Carbon\CarbonInterval;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Cache;

class Order extends Model
{
    use HasFactory;
    public $timestamps = true;
    protected $guarded = [];
    // protected $appends = ['status_classes', 'is_refunded_classes'];
    protected $hidden = [
        // 'id',
        'user',
        'user_id',
        'service_provider_id',
        // 'service_id',
        'profit',
        // 'service',
        'orderCancel',
        'orderRefills',
        'service_provider_status',
        'service_provider_order_id',
        'service_provider_order_log',
        'service_provider_status_log',
        'deleted_at',
    ];
    protected $casts = [
        'service_provider_order_log' => 'object',
        'service_provider_status_log' => 'object',
        'additional_input' => 'object',
    ];

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('id', $value)->where('user_id', auth()->id())->firstOrFail();
    }

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

    public function orderRefill()
    {
        return $this->hasOne('App\Models\Order\OrderRefill');
    }

    public function orderRefills()
    {
        return $this->hasMany('App\Models\Order\OrderRefill');
    }

    public function orderCancel()
    {
        return $this->hasOne('App\Models\Order\OrderCancel');
    }

    public function orderCancels()
    {
        return $this->hasMany('App\Models\Order\OrderCancel');
    }

    public function orderReviews()
    {
        return $this->hasMany('App\Models\Order\OrderReview');
    }

    protected function additionalInput(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (!$value) return;
                $value = json_decode($value, true);
                if (in_array($value['label'], ['custom_comments', 'custom_comments_package'])) {
                    return [
                        'label' => ServiceEnum::getValue('ARRAY_TYPE_LABELS')[$value['label']],
                        'value' => '' . str_replace("\r\n", ", ", $value['value']['comments']),
                    ];
                }
                if ($value['label'] == 'mentions_custom_list') {
                    return [
                        'label' => ServiceEnum::getValue('ARRAY_TYPE_LABELS')[$value['label']],
                        'value' => '' . str_replace("\r\n", ", ", $value['value']['usernames']),
                    ];
                }
                if ($value['label'] == 'mentions_with_hashtags') {
                    return [
                        'label' => ServiceEnum::getValue('ARRAY_TYPE_LABELS')[$value['label']],
                        'value' => '' . str_replace("\r\n", ", ", $value['value']['usernames']) . '<br><b>Hashtags: </b>' . str_replace("\r\n", ", ", $value['value']['hashtags']),
                    ];
                }
                if ($value['label'] == 'mentions_hashtag') {
                    return [
                        'label' => ServiceEnum::getValue('ARRAY_TYPE_LABELS')[$value['label']],
                        'value' => '' . str_replace("\r\n", ", ", $value['value']['hashtag']),
                    ];
                }
                if (in_array($value['label'], ['mentions_user_followers', 'comment_likes'])) {
                    return [
                        'label' => ServiceEnum::getValue('ARRAY_TYPE_LABELS')[$value['label']],
                        'value' => '' . str_replace("\r\n", ", ", $value['value']['username']),
                    ];
                }
                if ($value['label'] == 'mentions_media_likers') {
                    return [
                        'label' => ServiceEnum::getValue('ARRAY_TYPE_LABELS')[$value['label']],
                        'value' => '' . str_replace("\r\n", ", ", $value['value']['media_url']),
                    ];
                }
                if ($value['label'] == 'poll') {
                    return [
                        'label' => ServiceEnum::getValue('ARRAY_TYPE_LABELS')[$value['label']],
                        'value' => '' . str_replace("\r\n", ", ", $value['value']['answer_number']),
                    ];
                }
                if ($value['label'] == 'comment_replies') {
                    return [
                        'label' => ServiceEnum::getValue('ARRAY_TYPE_LABELS')[$value['label']],
                        'value' => '' . str_replace("\r\n", ", ", $value['value']['username']) . '<br><b>Komentar: </b>' . str_replace("\r\n", ", ", $value['value']['comments']),
                    ];
                }
            }
        );
    }

    // protected function orderedVia(): Attribute
    // {
    //     return Attribute::make(
    //         get: fn(string $value) => OrderEnum::getValue('ARRAY_ORDERED_VIA_LABELS')[$value],
    //     );
    // }

    // protected function statusClasses(): Attribute
    // {
    //     return new Attribute(
    //         get: fn() => OrderEnum::getValue('ARRAY_STATUS_CLASSES'),
    //     );
    // }

    // protected function isRefundedClasses(): Attribute
    // {
    //     return new Attribute(
    //         get: fn() => OrderEnum::getValue('ARRAY_IS_REFUNDED_CLASSES'),
    //     );
    // }

    protected function processTime(): Attribute
    {
        return new Attribute(
            get: function () {
                return (int) $this->created_at->diffInSeconds($this->updated_at);
            }
        );
    }

    protected function orderRefillButtonLabelInfo(): Attribute
    {
        return new Attribute(
            get: function () {
                if (!$this->service || !$this->service->is_refill_support || !$this->service->serviceProvider || $this->service->serviceProvider->type !== 'auto' || !$this->service->serviceProvider->is_refill_support) {
                    return 'Layanan tidak mendukung isi ulang.';
                }
                if ($this->status == 'completed' && $this->service && $this->service->refill_days && Carbon::parse($this->created_at)->diffInDays(Carbon::now()) > $this->service->refill_days) {
                    return 'Layanan hanya mendukung isi ulang selama ' . $this->service->refill_days . ' hari sejak pesanan dibuat.';
                }
                if ($this->status == 'completed' && $this->service && $this->service->refill_available_in_hours && Carbon::parse($this->created_at)->diffInHours(Carbon::now()) < $this->service->refill_available_in_hours) {
                    return 'isi ulang tersedia dalam ' . CarbonInterval::seconds((int) Carbon::now()->subHours($this->service->refill_available_in_hours)->diffInSeconds($this->created_at))->cascade()->forHumans();
                }
                if ($this->service && !$this->orderRefills->where('user_id', auth()->id())->sortByDesc('id')->isEmpty()) {
                    $orderRefill = $this->orderRefills->where('user_id', auth()->id())->sortByDesc('id')->first();
                    $cooldownUntil = Carbon::parse($orderRefill->created_at)->addHours($this->service->refill_available_in_hours ?: 24);
                    $remainingSeconds = now()->diffInSeconds($cooldownUntil, false);
                    if ($orderRefill->status == 'pending') {
                        return 'Isi ulang pesanan sedang dalam antrian.';
                    }
                    if (in_array($orderRefill->status, ['processing', 'in_progress'])) {
                        return 'Isi ulang pesanan sedang dalam proses, mohon tunggu proses selesai.';
                    }
                    if ($orderRefill->status === 'completed' && $remainingSeconds  > 0) {
                        return 'Coba lagi dalam ' . CarbonInterval::seconds($remainingSeconds)->cascade()->forHumans();
                    }
                }
                return;
            }
        );
    }

    protected function orderCancelButtonLabelInfo(): Attribute
    {
        return new Attribute(
            get: function () {
                if ($this->status !== 'pending') {
                    return 'Pesanan tidak dapat dibatalkan.';
                }
                $service = $this->service;
                if ($service && $this->orderCancel) {
                    return 'Permintaan pembatalan untuk pesanan ini sudah dibuat.';
                }
                if ($service) {
                    $remainingSeconds = now()->diffInSeconds(Carbon::parse($this->created_at)->addHour(), false);
                    if ($remainingSeconds > 0) {
                        return 'Pembatalan tersedia dalam ' . CarbonInterval::seconds($remainingSeconds)->cascade()->forHumans();
                    }
                }
                return;
            }
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
    }
}

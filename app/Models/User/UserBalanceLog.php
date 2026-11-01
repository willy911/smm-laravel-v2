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
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Enums\Account\Log\Balance as BalanceEnum;

class UserBalanceLog extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $guarded = [];
    protected $hidden = [
        'id',
        'user_id',
        'updated_at',
    ];
    protected $casts = [
        'content_params' => 'object',
    ];

    public function user()
    {
        return $this->belongsTo('App\Models\User\User');
    }

    protected function typeClasses(): Attribute
    {
        return new Attribute(
            get: fn() => BalanceEnum::getValue('ARRAY_TYPE_CLASSES'),
        );
    }

    protected function categoryLabels(): Attribute
    {
        return new Attribute(
            get: fn() => BalanceEnum::getValue('ARRAY_CATEGORY_LABELS'),
        );
    }
}

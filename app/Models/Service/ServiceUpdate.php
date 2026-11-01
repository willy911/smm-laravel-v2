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
use App\Enums\Service\ServiceUpdate as ServiceUpdateEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ServiceUpdate extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $guarded = [];
    // protected $appends = ['type_classes'];
    protected $casts = [
        'content_params' => 'object',
    ];

    public function service()
    {
        return $this->belongsTo('App\Models\Service\Service');
    }

    protected function typeClasses(): Attribute
    {
        return new Attribute(
            get: fn() => ServiceUpdateEnum::getValue('ARRAY_TYPE_CLASSES'),
        );
    }
}

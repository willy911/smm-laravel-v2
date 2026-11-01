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
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceCustomPrice extends Model
{
    use HasFactory, SoftDeletes;
    public $timestamps = true;
    protected $guarded = [];
    protected $hidden = [
        'id',
        'user_group_id',
        'service_category_id',
        'profit',
        'created_at',
        'updated_at',
        'deleted_at',
        'price_configs'
    ];
    protected $casts = [
        'price_configs' => 'object',
    ];

    public function service()
    {
        return $this->belongsTo('App\Models\Service\Service');
    }

    public function userGroup()
    {
        return $this->belongsTo('App\Models\User\UserGroup');
    }
}

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

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdminGroup extends Model
{
    use HasFactory, SoftDeletes;
    public $timestamps = true;
    protected $guarded = [];
    protected $visible = [
        'name',
        'roles',
        'is_primary',
    ];
    protected $casts = [
        'roles' => 'object',
        'is_primary' => 'boolean',
    ];

    public function admins()
    {
        return $this->hasMany('App\Models\Admin\Admin');
    }
}

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

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Foundation\Auth\User as Authenticable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Admin extends Authenticable
{
    use HasFactory, Notifiable, SoftDeletes;
    protected $guard = 'admin';
    public $timestamps = true;
    protected $guarded = [];
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function locale()
    {
        return $this->belongsTo('App\Models\Locale');
    }

    public function adminActivityLogs()
    {
        return $this->hasMany('App\Models\Admin\AdminActivityLog');
    }

    public function adminSigninLogs()
    {
        return $this->hasMany('App\Models\Admin\AdminSigninLog');
    }

    public function adminGroup()
    {
        return $this->belongsTo('App\Models\Admin\AdminGroup');
    }

    protected function group(): Attribute
    {
        return new Attribute(
            get: fn() => json_decode($this->adminGroup),
        );
    }

    public function hasRole(string $path): bool
    {
        $roles = $this->adminGroup?->roles;
        if (!$roles) {
            return false;
        }
        return (bool) data_get($roles, $path, false);
    }
}

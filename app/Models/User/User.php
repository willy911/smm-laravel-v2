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

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticable
{
    use HasFactory, Notifiable, SoftDeletes;
    // protected $guard = 'user';
    public $timestamps = true;
    protected $guarded = [];
    protected $hidden = [
        'password',
        'remember_token',
    ];
    protected $visible = [
        'username',
        'full_name',
        'balance',
        'email',
        'whatsapp',
        'api',
        'notification',
        'group',
        'created_at',
        'referral_code',
        'commission',
        'service_discount',
    ];
    protected $casts = [
        'api' => 'object',
        'notification' => 'object',
    ];

    public function locale()
    {
        return $this->belongsTo('App\Models\Locale');
    }

    public function leaderboards()
    {
        return $this->hasMany('App\Models\Leaderboard');
    }

    public function deposits()
    {
        return $this->hasMany('App\Models\Deposit\Deposit');
    }

    public function orders()
    {
        return $this->hasMany('App\Models\Order\Order');
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
        return $this->hasMany('App\Models\Order\OrderReview');
    }

    public function tickets()
    {
        return $this->hasMany('App\Models\Ticket\Ticket');
    }

    public function userGroup()
    {
        return $this->belongsTo('App\Models\User\UserGroup');
    }

    public function userSigninLogs()
    {
        return $this->hasMany('App\Models\User\UserSigninLog');
    }

    public function userSignupLogs()
    {
        return $this->hasMany('App\Models\User\UserSignupLog');
    }

    public function userActivityLogs()
    {
        return $this->hasMany('App\Models\User\UserActivityLog');
    }

    public function userBalanceLogs()
    {
        return $this->hasMany('App\Models\User\UserBalanceLog');
    }

    public function userCommissionWithdrawals()
    {
        return $this->hasMany('App\Models\User\UserCommissionWithdrawal');
    }

    public function userVerifyEmails()
    {
        return $this->hasMany('App\Models\User\UserVerifyEmail');
    }

    public function userPasswordResets()
    {
        return $this->hasMany('App\Models\User\UserPasswordReset');
    }

    public function userPasswordReset()
    {
        return $this->hasOne('App\Models\User\UserPasswordReset');
    }

    protected function api(): Attribute
    {
        return new Attribute(
            get: fn(string $value) => json_decode($value, true),
        );
    }

    protected function group(): Attribute
    {
        return new Attribute(
            get: fn() => json_decode($this->userGroup),
        );
    }

    public function upline()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function referrals()
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    protected static function booted(): void
    {
        static::creating(function ($user) {
            $user->referral_code = self::generateReferralCode();
        });
    }

    public static function generateReferralCode(): string
    {
        do {
            $code = strtolower(Str::random(5));
        } while (self::where('referral_code', $code)->exists());
        return $code;
    }
}

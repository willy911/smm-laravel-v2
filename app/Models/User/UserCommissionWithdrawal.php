<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserCommissionWithdrawal extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $guarded = [];
    protected $hidden = [
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo('App\Models\User\User');
    }
}

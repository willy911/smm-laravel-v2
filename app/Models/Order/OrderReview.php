<?php

namespace App\Models\Order;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderReview extends Model
{
    use HasFactory, SoftDeletes;

    public $timestamps = true;
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo('App\Models\User\User');
    }

    public function order()
    {
        return $this->belongsTo('App\Models\Order\Order');
    }

    public function service()
    {
        return $this->belongsTo('App\Models\Service\Service');
    }
}

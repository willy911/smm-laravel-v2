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

namespace App\Models\Ticket;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory;
    public $timestamps = true;
    protected $guarded = [];
    protected $hidden = [
        'is_read_admin',
        'deleted_at',
    ];

    public function user()
    {
        return $this->belongsTo('App\Models\User\User');
    }

    public function resolveRouteBinding($value, $field = null)
    {
        $route = request()->route();
        $prefix = $route ? explode('.', $route->getName())[0] : null;
        $query = $this->where('id', $value);
        if ($prefix === 'user') {
            $query->where('user_id', auth()->id());
        }
        return $query->firstOrFail();
    }


    public function ticketReplies()
    {
        return $this->hasMany('App\Models\Ticket\TicketReply');
    }
}

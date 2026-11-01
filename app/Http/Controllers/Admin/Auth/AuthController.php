<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott  
| * Whatsapp : https://wa.me/6285349680016  
| * Telegram : https://t.me/jhonroott   
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function signout()
    {
        if (!Auth::guard('admin')->check()) return to_route('admin.auth.signin');
        $admin = Auth::guard('admin')->user();
        $admin->update(['remember_token' => null]);
        AdminActivityLog::create([
            'admin_id'    => $admin->id,
            'ip_address'  => request()->ip(),
            'user_agent'  => request()->header('User-Agent'),
            'content_key'    => 'auth:log.signout-from-dashboard',
            'content_params' => (object) [],
        ]);
        Auth::guard('admin')->logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return to_route('admin.auth.signin')->with('responseSuccess', __('auth.toast.goodbye'));
    }
}

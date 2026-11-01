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

namespace App\Http\Controllers\User\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User\UserActivityLog;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function dashboard()
    {
        return inertia('user/dashboard');
    }

    public function signout(Request $request)
    {
        if (!Auth::check()) return to_route('guest.dashboard');
        $user = Auth::user();
        $user->update(['remember_token' => null]);
        $insertActivityLog = UserActivityLog::create([
            'user_id'     => $user->id,
            'ip_address'  => request()->ip(),
            'user_agent'  => request()->header('User-Agent'),
            'content_key'    => 'auth:log.signout-from-dashboard',
            'content_params' => (object) [],
        ]);
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        // Auth::logoutOtherDevices($user->password);
        return to_route('user.auth.signin')->with('responseSuccess', __('auth.toast.goodbye'));
    }
}

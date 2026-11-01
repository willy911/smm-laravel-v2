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

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Models\Admin\AdminSigninLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Events\Lockout;

class SigninController extends Controller
{
    public function create()
    {
        return inertia('admin/auth/signin');
    }

    public function store(SigninRequest $request)
    {
        $credentials['username'] = $request->input('admin.username');
        $credentials['password'] = $request->input('admin.password');
        $request->authenticate();
        $request->session()->regenerate();
        $admin = auth('admin')->user();
        if (!$admin->status) {
            Auth::logout();
            return back()->with('responseError', __('auth.toast.account_deactivated'));
        }
        AdminSigninLog::create([
            'admin_id'     => $admin->id,
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->header('User-Agent'),
        ]);
        AdminActivityLog::create([
            'admin_id'     => $admin->id,
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->header('User-Agent'),
            'content_key'    => 'auth:log.signin-to-dashboard',
            'content_params' => (object) [],
        ]);
        return to_route('admin.dashboard')->with('responseSuccess', __('common.toast.welcome', ['name' => Auth::guard('admin')->user()->full_name]));
    }
}

class SigninRequest extends FormRequest
{
    public function rules(Request $request)
    {
        return [
            'admin.username' => ['required', 'exists:admins,username'],
            'admin.password' => ['required'],
        ];
    }

    public function attributes()
    {
        return [
            'admin.username' => __('common.labels.username'),
            'admin.password' => __('common.labels.password'),
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();
        $credentials['username'] = $this->input('admin.username');
        $credentials['password'] = $this->input('admin.password');
        if (!Auth::guard('admin')->attempt($credentials, $this->boolean('admin.remember_me'))) {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'admin.username' => __('auth.toast.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'admin.username' => __('auth.toast.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    public function throttleKey(): string
    {
        return $this->ip();
    }
}

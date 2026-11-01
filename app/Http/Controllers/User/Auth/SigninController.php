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

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\User\UserSigninLog;
use App\Http\Controllers\Controller;
use App\Models\User\UserActivityLog;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class SigninController extends Controller
{
    public function create()
    {
        return inertia('user/auth/signin');
    }

    public function store(SigninRequest $request)
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = auth()->user();
        if (!$user->status) {
            Auth::logout();
            return back()->with('responseError', __('auth.toast.account_deactivated'));
        }
        UserSigninLog::create([
            'user_id'     => $user->id,
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->header('User-Agent'),
        ]);
        UserActivityLog::create([
            'user_id'     => $user->id,
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->header('User-Agent'),
            'content_key'    => 'auth:log.signin-to-dashboard',
            'content_params' => (object) [],
        ]);
        // Auth::logoutOtherDevices($credentials['password']);
        return to_route('guest.dashboard')->with('responseSuccess', __('common.toast.welcome', ['name' => Auth::user()->full_name]));
    }
}

class SigninRequest extends FormRequest
{
    public function rules(Request $request)
    {
        $rules = [
            'user.username' => ['required'],
            'user.password' => ['required', 'regex:/^[\w\d\p{P}\p{S}]+$/u'],
        ];
        if ($this->input('user.username')) {
            if (is_numeric($this->input('user.username'))) {
                $rules['user.username'][] = 'numeric';
                $rules['user.username'][] = 'phone:ID,mobile';
                $rules['user.username'][] = 'exists:users,whatsapp';
            } elseif (filter_var($this->input('user.username'), FILTER_VALIDATE_EMAIL)) {
                $rules['user.username'][] = 'email:rfc,dns';
                $rules['user.username'][] = 'exists:users,email';
            } else {
                $rules['user.username'][] = 'exists:users,username';
            }
        }
        return $rules;
    }

    public function attributes()
    {
        return [
            'user.username' => __('common.labels.username') . '/' . __('common.labels.email') . '/' . __('common.labels.whatsapp'),
            'user.password' => __('common.labels.password'),
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();
        $credentials['username'] = $this->input('user.username');
        if (is_numeric($this->input('user.username'))) {
            $credentials = ['whatsapp' => $this->input('user.username')];
        }
        if (filter_var($this->input('user.username'), FILTER_VALIDATE_EMAIL)) {
            $credentials = ['email' => $this->input('user.username')];
        }
        $credentials['password'] = $this->input('user.password');
        if (!Auth::attempt($credentials, $this->boolean('user.remember_me'))) {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'user.username' => __('auth.toast.failed'),
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
            'user.username' => __('auth.toast.throttle', [
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

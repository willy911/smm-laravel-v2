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

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Mail;
use App\Mail\User\Auth\RecoveryPassword;
use App\Mail\User\Auth\SendResetPasswordLink;
use App\Models\User\User;
use App\Models\User\UserActivityLog;
use App\Models\User\UserPasswordReset;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use App\Models\User\UserRecoveryPasswordEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class PasswordResetController extends Controller
{
    public function createRequest()
    {
        return inertia('user/auth/forgot-password');
    }

    public function storeRequest(ForgotPasswordRequest $request)
    {
        if (!$request->ajax()) return abort('404');
        if (!RateLimiter::attempt('limit: ' . $request->ip(), 1, function () {}, 30)) {
            $seconds = RateLimiter::availableIn('limit: ' . $request->ip());
            return back()->with('responseError', __('common.toast.throttle', ['seconds' => $seconds]));
        }
        $user = User::where([
            ['email', $request->input('user.email')],
            ['email_verified_at', '<>', null],
            ['status', '1']
        ])->first();
        if (!$user) {
            return back()->with('responseError', __('auth.toast.user_not_found'));
        }
        $token = md5($user->email . '-' . $user->username . '-' . rand(1, 99999));
        $checkRecoveryPasswordEmail = $recoveryPasswordEmail = UserPasswordReset::where('user_id', $user->id)->first();
        if (!$checkRecoveryPasswordEmail) {
            $insertRecoveryPasswordEmail = $recoveryPasswordEmail = UserPasswordReset::create([
                'user_id' => $user->id,
                'token'   => $token
            ]);
        } else {
            $token = $recoveryPasswordEmail->token;
        }
        Mail::to($user->email)->queue(new SendResetPasswordLink((object) [
            'user'  => $user,
            'token' => $token
        ]));
        return back()->with('responseSuccess', __('auth.toast.reset_email_sent'));
    }

    public function createReset(UserPasswordReset $userPasswordReset)
    {
        return inertia('user/auth/reset-password', [
            'pageProps' => [
                'user'  => $userPasswordReset->user,
                'token' => $userPasswordReset->token
            ]
        ]);
    }

    public function storeReset(ResetPasswordRequest $request, UserPasswordReset $userPasswordReset)
    {
        $userPasswordReset->user->update([
            'password'   => escape_input(Hash::make($request->input('user.new_password'))),
        ]);
        $userPasswordReset->delete();
        $insertActivityLog = UserActivityLog::create([
            'user_id'     => $userPasswordReset->user->id,
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->header('User-Agent'),
            'content_key'    => 'auth:log.update-password',
            'content_params' => (object) [],
        ]);
        return to_route('user.auth.signin')->with('responseSuccess', __('auth.toast.update_password'));
    }
}

class ForgotPasswordRequest extends FormRequest
{
    public function rules()
    {
        return [
            'user.email' => [
                'required',
                Rule::exists('users', 'email')->whereNotNull('email_verified_at')->where('status', '1')
            ],
        ];
    }

    public function attributes()
    {
        return [
            'user.email' => __('common.labels.email'),
        ];
    }
}


class ResetPasswordRequest extends FormRequest
{
    public function rules(Request $request)
    {
        return [
            'user.new_password' => ['required', 'regex:/^[\w\d\p{P}\p{S}]+$/u', 'min:5', 'max:20'],
        ];
    }

    public function attributes()
    {
        return [
            'user.new_password' => __('common.labels.new_password'),
        ];
    }
}

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

namespace App\Http\Controllers\User\Account\Verify;

use App\Models\User\User;
use App\Http\Controllers\Controller;
use App\Models\User\UserActivityLog;
use App\Models\User\UserVerifyEmail;
use Illuminate\Support\Facades\Mail;
use App\Mail\User\Account\Verify\Email as UserAccountVerifyEmailMail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Exceptions\HttpResponseException;

class EmailController extends Controller
{
    public function verify(User $user, UserVerifyEmail $userVerifyEmail)
    {
        $userVerifyEmail->delete();
        $user->update([
            'email_verified_at' => now(),
            'updated_at' => now(),
        ]);
        $insertActivityLog = UserActivityLog::create([
            'user_id'     => $user->id,
            'ip_address'  => request()->ip(),
            'user_agent'  => request()->header('User-Agent'),
            'content_key'    => 'account:email-verification.log.email-verified-successful',
            'content_params' => (object) [],
        ]);
        return to_route('guest.dashboard')->with('responseSuccess', __('account.toast.email_verified_successful'));
    }

    public function resend()
    {
        if (!RateLimiter::attempt('verify-email: ' . auth()->user()->username, 1, function () {}, 30)) {
            $seconds = RateLimiter::availableIn('verify-email: ' . auth()->user()->username);
            throw new HttpResponseException(response()->json([
                'status'  => false,
                'message' => __('common.toast.throttle', ['seconds' => $seconds]),
            ], 429)->header('retry-after', $seconds));
        }
        $checkVerifyEmail = $verifyEmail = UserVerifyEmail::where('user_id', auth()->user()->id)->first();
        if (!$checkVerifyEmail) {
            return response()->json([
                'status'  => false,
                'message' => __('common.empty.no_data_found')
            ]);
        } else {
            $verifyEmail->update([
                'created_at' => now()
            ]);
        }
        $sendVerifyEmail = Mail::to(auth()->user()->email)->queue(new UserAccountVerifyEmailMail(
            (object) [
                'user'        => auth()->user(),
                'verifyToken' => $verifyEmail->token
            ]
        ));
        return response()->json([
            'status' => true,
            'message' => __('account.email_verification.toast.email_resent_successful')
        ]);
    }
}

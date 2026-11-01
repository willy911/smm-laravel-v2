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

namespace App\Http\Middleware\User\Account;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Models\User\UserVerifyEmail;
use Illuminate\Support\Facades\Mail;
use App\Mail\User\Account\Verify\Email as UserAccountVerifyEmailMail;
use Symfony\Component\HttpFoundation\Response;

class Verify
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->method() == 'GET' && website_config('menu')->user->account_verification->enabled == '1') {
            // if (auth()->check() && !auth()->user()->email_verified_at && website_config('menu')->user->account_verification->method == 'only_email') {
            //     $checkVerifyEmail = $verifyEmail = UserVerifyEmail::where('user_id', auth()->user()->id)->first();
            //     if (!$checkVerifyEmail) {
            //         $verifyToken = md5(auth()->user()->email . '-' . auth()->user()->username . '-' . rand(1, 99999));
            //         $verifyEmail = UserVerifyEmail::create([
            //             'user_id' => auth()->user()->id,
            //             'token'   => $verifyToken
            //         ]);
            //         $sendVerifyEmail = Mail::to(auth()->user()->email)->queue(new UserAccountVerifyEmailMail(
            //             (object) [
            //                 'user'        => auth()->user(),
            //                 'verifyToken' => $verifyToken
            //             ]
            //         ));
            //     }
            //     return inertia('user/account/verify/email', [
            //         'pageProps' => [
            //             'retryAfter' => Carbon::parse($verifyEmail->created_at)->diffInSeconds(now()),
            //             'user'       => auth()->user(),
            //             'verify'     => $verifyEmail
            //         ],
            //     ])->toResponse($request);
            // }
            if (website_config('menu')->user->account_verification->method == 'only_whatsapp') {
                // soon
            }
            if (website_config('menu')->user->account_verification->method == 'all') {
                // soon
            }
        }
        return $next($request);
    }
}

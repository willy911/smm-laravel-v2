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

use App\Models\User\User;
use Illuminate\Http\Request;
use App\Models\User\UserSignupLog;
use App\Http\Controllers\Controller;
use App\Models\Locale;
use App\Models\User\UserActivityLog;
use App\Models\Website\WebsiteSitemap;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

class SignupController extends Controller
{
    public function create()
    {
        return inertia('user/auth/signup', [
            'pageProps' => [
                'tos' => WebsiteSitemap::where('slug', 'tos')->first()
            ]
        ]);
    }

    public function store(SignupRequest $request)
    {
        // if (UserSignupLog::where('ip_address', $request->ip())->exists()) {
        //     return back()->with('responseError', __('auth.toast.already_registered'));
        // }

        DB::transaction(function () use ($request) {
            $referredBy = User::whereKey(
                $request->cookie('referred_by')
            )->exists()
                ? $request->cookie('referred_by')
                : null;
            $locale = Locale::where(
                'locale',
                $request->validated('user.locale')
            )->first();
            $user = User::create([
                'user_group_id' => 1,
                'locale_id'     => $locale->id,
                'full_name'     => ucwords($request->validated('user.full_name')),
                'whatsapp'      => $request->validated('user.whatsapp'),
                'email'         => $request->validated('user.email'),
                'username'      => $request->validated('user.username'),
                'password'      => Hash::make($request->validated('user.password')),
                'api' => [
                    'api_key'      => generate_api_key(),
                    'secret_key'   => '',
                    'whitelist_ip' => '',
                ],
                'notification' => [
                    'order'   => ['email' => 0, 'whatsapp' => 0, 'telegram' => 0],
                    'deposit' => ['email' => 0, 'whatsapp' => 0, 'telegram' => 0],
                    'ticket'  => ['email' => 0, 'whatsapp' => 0, 'telegram' => 0],
                ],
                'referred_by' => null,
            ]);

            if ($referredBy && $referredBy != $user->id) {
                $user->update([
                    'referred_by' => $referredBy,
                ]);
            }
            UserSignupLog::create([
                'user_id'     => $user->id,
                'ip_address'  => $request->ip(),
                'user_agent'  => $request->header('User-Agent'),
            ]);
            UserActivityLog::create([
                'user_id'        => $user->id,
                'ip_address'     => $request->ip(),
                'user_agent'     => $request->header('User-Agent'),
                'content_key'    => 'auth:log.signup-successful',
                'content_params' => (object) [],
            ]);
        });
        return to_route('user.auth.signin')
            ->withoutCookie('referred_by')
            ->with('responseSuccess', __('auth.toast.signup_successful'));
    }
}

class SignupRequest extends FormRequest
{
    // public function prepareForValidation()
    // {
    //     $this->merge([
    //         'user' => [
    //             'full_name' => escape_input($this->input('user.full_name')),
    //             'whatsapp'  => escape_input($this->input('user.whatsapp')),
    //             'email'     => escape_input($this->input('user.email')),
    //             'username'  => escape_input($this->input('user.username')),
    //             'password'  => escape_input($this->input('user.password')),
    //         ],
    //     ]);
    // }

    public function rules(Request $request)
    {
        return [
            'user.locale'    => ['required', 'exists:locales,locale'],
            'user.full_name' => ['required', 'min:8', 'regex:/^[\pL\s\-]+$/u'],
            // 'user.whatsapp'  => ['required', 'min:5', 'regex:/^\+?[1-9]\d{1,14}$/', 'unique:users,whatsapp'],
            'user.whatsapp'  => ['required', 'min:5', 'numeric', 'unique:users,whatsapp'],
            'user.email'     => ['required', 'lowercase', 'email:rfc,dns', 'unique:users,email'],
            'user.username'  => ['required', 'lowercase', 'alpha_num:ascii', 'min:8', 'max:20', 'unique:users,username'],
            'user.password'  => ['required', 'regex:/^[\w\d\p{P}\p{S}]+$/u', 'min:8'],
        ];
    }

    public function attributes()
    {
        return [
            'user.locale'    => __('common.labels.language') . ' & ' . __('common.labels.currency'),
            'user.full_name' => __('common.labels.full_name'),
            'user.whatsapp'  => __('common.labels.whatsapp'),
            'user.email'     => __('common.labels.email'),
            'user.username'  => __('common.labels.username'),
            'user.password'  => __('common.labels.password'),
        ];
    }
}

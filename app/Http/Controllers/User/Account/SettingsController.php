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

namespace App\Http\Controllers\User\Account;

use App\Http\Controllers\Controller;
use App\Models\User\UserActivityLog;
use App\Rules\WhitelistIP;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    public function edit()
    {
        return inertia('user/account/settings');
    }

    public function update(UpdateRequest $request)
    {
        if (!Hash::check($request->input('user.current_password'), auth()->user()->password)) {
            return back()->with('responseError', __('validation.current_password'));
        }
        if ($request->input('type') == 'profile') {
            $credentials = [
                'full_name'    => escape_input(ucwords($request->input('user.full_name'))),
                'whatsapp'     => escape_input($request->input('user.whatsapp')),
            ];
            if ($request->input('user.new_password')) $credentials['password'] = escape_input(Hash::make($request->input('user.new_password')));
            auth()->user()->update($credentials);
        }
        if ($request->input('type') == 'api') auth()->user()->update([
            'api' => (object) [
                'api_key'      => auth()->user()->api['api_key'],
                'secret_key'   => $request->input('api.secret_key'),
                'whitelist_ip' => $request->input('api.whitelist_ip'),
            ]
        ]);
        $insertActivityLog = UserActivityLog::create([
            'user_id'     => Auth::id(),
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->header('User-Agent'),
            'content_key'    => ($request->input('type') == 'api') ? 'account:settings.log.update-api-successful' : 'account:settings.log.update-profile-successful',
            'content_params' => (object) [],
        ]);
        return redirect()->back()->with('responseSuccess', (($request->input('type') == 'profile') ? __('account.settings.toast.update_profile_successful') : __('account.settings.toast.update_api_successful')));
    }

    public function switch($menu, $platform, $value)
    {
        if (RateLimiter::tooManyAttempts($rateKey = 'switch-notification:' . auth()->id(), 10)) {
            $seconds = RateLimiter::availableIn($rateKey);
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.throttle', ['seconds' => $seconds]),
            ], 429);
        }
        RateLimiter::hit($rateKey);
        $user = Auth::user();
        $currentNotifications = json_decode(json_encode($user->notification), true);
        $currentNotifications[$menu][$platform] = $value ? 1 : 0;
        $user->notification = $currentNotifications;
        $update = $user->save();
        if ($update) {
            return response()->json([
                'status' => true,
                'message' => __('account.settings.toast.update_notification_successful'),
            ]);
        }
        return response()->json([
            'status'  => false,
            'message' => __('common.toast.exception')
        ], 500);
    }
}

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(Request $request)
    {
        if ($request->input('type') == 'api') {
            return [
                'api.secret_key'        => ['required', 'alpha_num:ascii'],
                'api.whitelist_ip'      => ['required', new WhitelistIP],
                'user.current_password' => ['required', 'current_password'],
            ];
        }
        return [
            'user.full_name'        => ['required', 'min:8', 'regex:/^[\pL\s\-]+$/u', Rule::unique('users', 'full_name')->ignore(auth()->id())],
            'user.whatsapp'         => ['required', 'required', 'numeric', 'phone:ID,mobile', Rule::unique('users', 'whatsapp')->ignore(auth()->id())],
            'user.new_password'     => ['nullable', 'min:8', 'different:user.current_password'],
            'user.current_password' => ['required', 'current_password'],
        ];
    }

    public function attributes()
    {
        return [
            'api.secret_key' => __('common.labels.secret_key'),
            'api.whitelist_ip' => __('common.labels.whitelist_ip'),
            'user.full_name'        => __('common.labels.full_name'),
            'user.whatsapp'         => __('common.labels.whatsapp'),
            'user.new_password'     => __('common.labels.new_password'),
            'user.current_password' => __('common.labels.current_password'),
        ];
    }
}

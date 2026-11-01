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

namespace App\Http\Controllers\Admin\Account;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    /**
     * Halaman pengaturan akun admin yang sedang masuk.
     *
     * Hanya menampilkan field yang benar-benar ada di tabel admins
     * (id, admin_group_id, locale_id, username, password, full_name,
     * remember_token, status + timestamps) — tidak ada kolom email.
     */
    public function edit()
    {
        $admin = auth('admin')->user();

        return inertia('admin/account/settings', [
            'admin' => [
                'username'  => $admin->username,
                'full_name' => $admin->full_name,
            ],
        ]);
    }

    /**
     * Perbarui profil admin (full_name, dan username bila dikirim form).
     */
    public function update(UpdateRequest $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);

        $credentials = [
            'full_name' => escape_input(ucwords($request->input('admin.full_name'))),
        ];
        if ($request->filled('admin.username')) {
            $credentials['username'] = escape_input($request->input('admin.username'));
        }

        $target = auth('admin')->user();
        $target->update($credentials);

        if ($target->wasChanged()) {
            AdminActivityLog::create([
                'admin_id'       => auth('admin')->user()->id,
                'ip_address'     => $request->ip(),
                'user_agent'     => $request->header('User-Agent'),
                'content_key'    => 'admin/common:log.update-successful',
                'content_params' => (object) [
                    'item' => 'admin/common:labels.admin',
                    'id'   => $target->id,
                ],
                'updated_columns' => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
            ]);
        }

        return redirect()->back()->with('responseSuccess', __('admin/account.toast.update_profile_successful'));
    }

    /**
     * Perbarui kata sandi admin yang sedang masuk.
     *
     * Kata sandi lama divalidasi dengan Hash::check — jika salah, kembali
     * dengan flash error (bukan exception/500). Tidak ada logout paksa
     * agar sesi admin saat ini tetap berlaku.
     */
    public function updatePassword(UpdatePasswordRequest $request)
    {
        if (!Hash::check($request->input('current_password'), auth('admin')->user()->password)) {
            return back()->with('responseError', __('admin/account.toast.current_password_incorrect'));
        }

        auth('admin')->user()->update([
            'password' => Hash::make($request->input('new_password')),
        ]);

        AdminActivityLog::create([
            'admin_id'       => auth('admin')->id(),
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->header('User-Agent'),
            'content_key'    => 'admin/account:log.update-password-successful',
            'content_params' => (object) [],
        ]);

        return redirect()->back()->with('responseSuccess', __('admin/account.toast.update_password_successful'));
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
        return [
            'admin.full_name' => ['required', 'string', 'min:8', 'max:20'],
            'admin.username'  => [
                'nullable',
                'alpha_num:ascii',
                'min:8',
                'max:20',
                Rule::unique('admins', 'username')->ignore(auth('admin')->id()),
            ],
        ];
    }

    public function attributes()
    {
        return [
            'admin.full_name' => __('admin/account.labels.full_name'),
            'admin.username'  => __('admin/account.labels.username'),
        ];
    }
}

class UpdatePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(Request $request)
    {
        return [
            'current_password'          => ['required', 'string'],
            'new_password'              => ['required', 'string', 'min:8', 'max:20', 'confirmed'],
            'new_password_confirmation' => ['required_with:new_password'],
        ];
    }

    public function attributes()
    {
        return [
            'current_password' => __('admin/account.labels.current_password'),
            'new_password'     => __('admin/account.labels.new_password'),
        ];
    }
}

<?php

namespace App\Install\Controllers;

use App\Http\Controllers\Controller;
use App\Install\Services\EnvWriter;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;

class InstallController extends Controller
{
    protected function checkInstalled()
    {
        if (file_exists(storage_path('installed'))) {
            abort(404);
        }
    }

    public function welcome()
    {
        $this->checkInstalled();
        return view('install.welcome');
    }

    public function requirements()
    {
        $this->checkInstalled();

        $requirements = [
            'PHP >= 8.1' => version_compare(PHP_VERSION, '8.1', '>='),
            'OpenSSL' => extension_loaded('openssl'),
            'PDO' => extension_loaded('pdo'),
            'Mbstring' => extension_loaded('mbstring'),
            'Tokenizer' => extension_loaded('tokenizer'),
        ];

        return view('install.requirements', compact('requirements'));
    }

    public function setup()
    {
        $this->checkInstalled();
        return view('install.setup');
    }

    public function process(InstallRequest $request)
    {
        $this->checkInstalled();

        EnvWriter::write($request->validated());

        try {
            DB::purge();
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            return back()->withErrors('Koneksi database gagal');
        }

        Artisan::call('key:generate');
        Artisan::call('migrate', ['--force' => true]);
        Artisan::call('db:seed', ['--force' => true]);

        User::create([
            'name' => $request->ADMIN_NAME,
            'email' => $request->ADMIN_EMAIL,
            'password' => Hash::make($request->ADMIN_PASSWORD),
            'role' => 'admin',
        ]);

        file_put_contents(storage_path('installed'), now());

        return redirect('/install/finish');
    }

    public function finish()
    {
        return view('install.finish');
    }
}

class InstallRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'DB_HOST' => 'required',
            'DB_DATABASE' => 'required',
            'DB_USERNAME' => 'required',
            'DB_PASSWORD' => 'nullable',

            'APP_COLOR' => 'required|string',

            'AWS_ACCESS_KEY_ID' => 'required',
            'AWS_SECRET_ACCESS_KEY' => 'required',
            'AWS_DEFAULT_REGION' => 'required',
            'AWS_BUCKET' => 'required',
            'AWS_URL' => 'required|url',
            'AWS_ENDPOINT' => 'required|url',
            'AWS_USE_PATH_STYLE_ENDPOINT' => 'required|boolean',

            'ADMIN_NAME' => 'required',
            'ADMIN_EMAIL' => 'required|email',
            'ADMIN_PASSWORD' => 'required|min:6',
        ];
    }
}

<?php

namespace App\Providers;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;
use App\Models\Config;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //     
    }

    public function boot(): void
    {
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }
        $configs = Cache::remember('configs', now()->addMinutes(10), function () {
            try {
                $configs = [];
                $model = Config::all();
                foreach ($model as $item) {
                    $configs[$item->key] = json_decode($item->value);
                }
                return $configs;
            } catch (Exception $error) {
                $fallback = [];
                foreach (config('app.jhonroot') as $key => $item) {
                    $fallback[$key] = json_decode($item);
                }
                return $fallback;
            }
        });

        app()->instance('jhonroot', $configs);

        if (app('jhonroot')) {
            config(['mail.mailers.smtp.username' => app('jhonroot')['smtp']->username ?? '']);
            config(['mail.mailers.smtp.password' => app('jhonroot')['smtp']->password ?? '']);
            config(['mail.mailers.smtp.encryption' => app('jhonroot')['smtp']->encryption ?? '']);
            config(['mail.mailers.smtp.port' => app('jhonroot')['smtp']->port ?? '']);
            config(['mail.mailers.smtp.host' => app('jhonroot')['smtp']->host ?? '']);
            config(['mail.from.address' => app('jhonroot')['smtp']->from ?? '']);
            config(['mail.from.name' => website_config()->name ?? '']);
        }
    }
}

<?php

namespace App\Http\Middleware;

use App\Models\Locale;
use Closure;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Session;

class HandleLocale
{
    public function handle($request, Closure $next)
    {
        $defaultLocale = config('app.locale');
        $locale = $request->cookie('locale');
        if (!$locale) {
            $locale = $defaultLocale;
            Cookie::queue(
                Cookie::make('locale', $locale, 60 * 24 * 365 * 5)
            );
        }
        App::setLocale($locale);
        $guard = $request->route()->named('admin.*') ? 'admin' : 'web';
        $user  = auth($guard)->user();
        if ($user && $user->locale && $locale !== $user->locale->locale) {
            $getLocale = Locale::where('locale', $locale)->first();
            if ($getLocale) {
                $user->update([
                    'locale_id' => $getLocale->id,
                ]);
            }
        }
        return $next($request);
    }
}

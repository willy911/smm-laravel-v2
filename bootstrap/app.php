<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\HandleLocale;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        apiPrefix: 'api/',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function () {
            // Route install DIHAPUS PERMANEN (keputusan user 01-11-2026, audit keamanan).
            // Aplikasi sudah terpasang; /install dulu bisa menimpa .env + APP_KEY.
            // Berkas routes/install.php & app/Install/ dibiarkan mati (tidak direferensikan).
            Route::middleware('web')->prefix('ajax')->name('ajax.')->group(base_path('routes/ajax.php'));
            Route::middleware('web')->prefix(website_config('prefix')->admin_url)->name('admin.')->group(base_path('routes/admin.php'));
            Route::middleware('web')->name('user.')->group(base_path('routes/user.php'));
            Route::middleware('web')->prefix('callback')->name('callback.')->group(base_path('routes/callback.php'));
            Route::middleware('api-v2')->prefix('api')->group(base_path('routes/api-v2.php'));
        }
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(append: [
            \App\Http\Middleware\API::class,
        ]);
        $middleware->group('api-v2', [
            \App\Http\Middleware\APIV2::class,
        ]);
        $middleware->validateCsrfTokens(except: [
            '/callback/*',
        ]);
        $middleware->alias([
            'user.account.verify' =>  App\Http\Middleware\User\Account\Verify::class,
        ]);
        $middleware->redirectTo(fn(Request $request) => $request->expectsJson() ? null : (request()->segment(1) == website_config('prefix')->admin_url ? route('admin.auth.signin') : route('user.auth.signin')));
        $middleware->redirectUsersTo(function (Request $request) {
            $isAdminRoute = $request->segment(1) === website_config('prefix')->admin_url;
            if ($isAdminRoute && auth('admin')->check()) {
                return route('admin.dashboard');
            }
            if (! $isAdminRoute && auth()->check()) {
                return route('guest.dashboard');
            }
            return route('guest.dashboard');
        });
        $middleware->encryptCookies(except: ['appearance']);
        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            HandleLocale::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        if (request()->routeIs('api*')) {
            $exceptions->respond(function (Response $response, Throwable $exception, $request) {
                return response()->json([
                    'status'  => false,
                    'message' => website_config()->name,
                ], $response->getStatusCode(), [], JSON_PRETTY_PRINT);
            });
        }
        $exceptions->renderable(function (AuthenticationException $exception, $request) {
            if ($request->expectsJson()) return response()->json(['error' => 'Unauthenticated.'], 401);
            return to_route(($exception->guards()[0] == 'admin') ? 'admin.auth.signin' : 'user.auth.signin')->with('responseError', __('auth.toast.must_signin_first'));
        });
        $exceptions->respond(function (Response $response, Throwable $exception, $request) {
            if (!app()->environment(['production'])) return $response;
            if (in_array($response->getStatusCode(), [500, 503, 404, 403])) {
                return inertia('Error', [
                    'status' => $response->getStatusCode(),
                    'websiteConfig' => website_config('all'),
                ])->toResponse($request)->setStatusCode($response->getStatusCode());
            } elseif ($response->getStatusCode() === 419) {
                return back()->with([
                    'message' => 'Halaman kadaluarsa.',
                ]);
            }
            return $response;
        });
    })->create();

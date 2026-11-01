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

use App\Mail\Example;
use App\Mail\OrderShipped;
use App\Models\ProductBrand;
use Illuminate\Http\Request;
use App\Models\User\User;
use App\Models\User\UserVerifyEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

Route::get('ref/{refCode}', function ($refCode) {
    $user = User::where('referral_code', $refCode)->first();
    if (!$user) {
        return to_route('user.auth.signup');
    }
    return redirect()
        ->route('user.auth.signup')
        ->cookie(
            'referred_by',
            $user->id,
            60 * 24 * 7
        );
})->middleware('guest')->name('ref-link');

Route::prefix('auth')->name('auth.')->middleware('guest')->group(function () {
    if (website_config('menu')->user->auth->signup->enabled === '1') {
        Route::get('signup', [\App\Http\Controllers\User\Auth\SignupController::class, 'create'])->name('signup');
        Route::post('signup', [\App\Http\Controllers\User\Auth\SignupController::class, 'store'])->middleware(['precognitive']);
    }

    if (website_config('menu')->user->auth->reset_password->enabled === '1') {
        Route::get('forgot-password', [\App\Http\Controllers\User\Auth\PasswordResetController::class, 'createRequest'])->name('password.request');
        Route::post('forgot-password', [\App\Http\Controllers\User\Auth\PasswordResetController::class, 'storeRequest'])->middleware(['precognitive']);
        Route::get('reset-password/{userPasswordReset:token}', [\App\Http\Controllers\User\Auth\PasswordResetController::class, 'createReset'])->name('password.reset');
        Route::post('reset-password/{userPasswordReset:token}', [\App\Http\Controllers\User\Auth\PasswordResetController::class, 'storeReset'])->middleware(['precognitive'])->name('password.store');
    }

    Route::get('signin', [\App\Http\Controllers\User\Auth\SigninController::class, 'create'])->name('signin');
    Route::post('signin', [\App\Http\Controllers\User\Auth\SigninController::class, 'store'])->middleware(['precognitive']);

    Route::get('signout', [\App\Http\Controllers\User\Auth\AuthController::class, 'signout'])->withoutMiddleware(['guest'])->name('signout');
});

Route::group(['middleware' => ['auth', 'auth.session', 'user.account.verify']], function () {
    // Menu Afiliasi: on/off via Website Config (configs.menu.user.affiliate.enabled).
    // Semua lapis (gate route, sidebar, switch admin) membaca flag yang sama.
    if (website_config('menu')->user->affiliate->enabled == '1') {
        Route::prefix('affiliate')->name('affiliate.')->group(function () {
            Route::get('/', [\App\Http\Controllers\User\AffiliateController::class, 'index'])->name('index');
            Route::post('commission-withdrawal', [\App\Http\Controllers\User\AffiliateController::class, 'withdraw'])->name('commission-withdrawal');
        });
    }

    if (website_config('menu')->user->leaderboard->enabled == '1') {
        Route::get('leaderboard', \App\Http\Controllers\User\LeaderboardController::class)->name('leaderboard');
    }
    Route::group(['prefix' => 'verify'], function () {
        Route::get('email/{user:username}/{userVerifyEmail:token}', [\App\Http\Controllers\User\Account\Verify\EmailController::class, 'verify'])->withoutMiddleware(['auth', 'user.account.verify'])->name('account.verify.email.check');
        Route::get('resend-email', [\App\Http\Controllers\User\Account\Verify\EmailController::class, 'resend'])->withoutMiddleware(['user.account.verify'])->name('account.verify.email.resend');
    });

    Route::group(['prefix' => 'account'], function () {
        Route::group(['prefix' => 'settings'], function () {
            Route::get('/', [\App\Http\Controllers\User\Account\SettingsController::class, 'edit'])->name('account.settings');
            Route::post('/', [\App\Http\Controllers\User\Account\SettingsController::class, 'update'])->middleware('precognitive');
            Route::post('switch/notification/{menu}/{platform}/{value}', [\App\Http\Controllers\User\Account\SettingsController::class, 'switch'])
                ->whereIn('menu', ['order', 'deposit', 'ticket'])
                ->whereIn('platform', ['email', 'whatsapp', 'telegram'])
                ->whereIn('value', ['1', '0'])->name('account.settings.switch.notification');
        });
        Route::group(['prefix' => 'logs'], function () {
            Route::get('balance', \App\Http\Controllers\User\Account\Log\BalanceController::class)->name('account.logs.balance');
            Route::get('signin', \App\Http\Controllers\User\Account\Log\SigninController::class)->name('account.logs.signin');
            Route::get('activity', \App\Http\Controllers\User\Account\Log\ActivityController::class)->name('account.logs.activity');
        });
    });

    Route::group(['prefix' => 'orders'], function () {
        Route::group(['prefix' => 'create'], function () {
            Route::get('{target:id?}', [\App\Http\Controllers\User\Order\OrderController::class, 'create'])->name('orders.create');
            Route::post('{target:id?}', [\App\Http\Controllers\User\Order\OrderController::class, 'store'])->middleware('precognitive')->name('orders.store');
        });
        Route::get('/', [\App\Http\Controllers\User\Order\OrderController::class, 'index'])->name('orders.index');
        Route::get('refills', \App\Http\Controllers\User\Order\RefillController::class)->name('orders.refills.index');
        Route::post('reviews', [\App\Http\Controllers\User\Order\ReviewController::class, 'store'])->name('orders.reviews.store');
        Route::get('report', [\App\Http\Controllers\User\Order\OrderController::class, 'report'])->name('orders.report');
    });

    Route::prefix('deposits')->name('deposits.')->group(function () {
        Route::get('/', [\App\Http\Controllers\User\DepositController::class, 'index'])->name('index');
        Route::get('create', [\App\Http\Controllers\User\DepositController::class, 'create'])->name('create');
        Route::post('create', [\App\Http\Controllers\User\DepositController::class, 'store'])->middleware('precognitive')->name('store');
        Route::post('switch/{target:id}/{columnName}/{columnValue}', [\App\Http\Controllers\User\DepositController::class, 'switch'])
            ->whereIn('columnName', \App\Enums\Deposit\Deposit::getValue('ARRAY_ENABLED_COLUMN_NAME_SWITCH'))
            ->whereIn('columnValue', \App\Enums\Deposit\Deposit::getValue('ARRAY_ENABLED_COLUMN_VALUE_SWITCH'))->name('switch');
        Route::get('report', [\App\Http\Controllers\User\DepositController::class, 'report'])->name('report');
    });

    Route::prefix('tickets')->name('tickets.')->group(function () {
        Route::resource('/', \App\Http\Controllers\User\TicketController::class)->except([
            'show',
            'edit',
            'destroy'
        ])->parameters(['' => 'target'])->scoped(['target' => 'id']);
        Route::get('reply/{target:id}', [\App\Http\Controllers\User\TicketController::class, 'edit'])->name('edit');
    });
});

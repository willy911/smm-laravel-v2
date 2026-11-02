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

use App\Models\User\UserGroup;
use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'auth', 'middleware' => ['guest:admin']], function () {
    Route::get('signin', [\App\Http\Controllers\Admin\Auth\SigninController::class, 'create'])->name('auth.signin');
    Route::post('signin', [\App\Http\Controllers\Admin\Auth\SigninController::class, 'store'])->middleware(['precognitive']);
    Route::get('signout', [\App\Http\Controllers\Admin\Auth\AuthController::class, 'signout'])->withoutMiddleware(['guest:admin'])->name('auth.signout');
});

Route::group(['middleware' => ['auth:admin', 'auth.session']], function () {
    Route::get('/', \App\Http\Controllers\Admin\DashboardController::class)->name('dashboard');
    Route::get('leaderboard', \App\Http\Controllers\Admin\LeaderboardController::class)->name('leaderboard');

    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\Account\SettingsController::class, 'edit'])->name('edit');
        Route::post('/', [\App\Http\Controllers\Admin\Account\SettingsController::class, 'update'])->name('update');
        Route::post('update-password', [\App\Http\Controllers\Admin\Account\SettingsController::class, 'updatePassword'])->name('update-password');
    });

    Route::prefix('locales')->name('locales.')->group(function () {
        Route::resource('', \App\Http\Controllers\Admin\LocaleController::class)->only([
            'index',
            'store',
            'update',
        ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
        Route::post('action/{action}', [\App\Http\Controllers\Admin\LocaleController::class, 'action'])
            ->whereIn('action', ['trash', 'restore', 'destroy'])
            ->name('action');
        Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\LocaleController::class, 'switch'])
            ->whereIn('columnName', ['status'])->name('switch');
        Route::get('options', [\App\Http\Controllers\Admin\LocaleController::class, 'options'])->name('options');
        Route::post('sort', [\App\Http\Controllers\Admin\LocaleController::class, 'sort'])->name('sort');
        Route::post('{target:id}/check-balance', [\App\Http\Controllers\Admin\LocaleController::class, 'checkBalance'])->name('check-balance');
        Route::post('sync-kurs', [\App\Http\Controllers\Admin\LocaleController::class, 'syncKurs'])->name('sync-kurs');
    });

    Route::prefix('affiliates')->name('affiliates.')->group(function () {
        Route::resource('/', \App\Http\Controllers\Admin\AffiliateController::class)->only([
            'index',
            'store',
            'update',
        ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
        Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\AffiliateController::class, 'switch'])
            ->whereIn('columnName', ['status', 'user_group_id'])->name('switch');
    });

    Route::prefix('profit-loss')->name('profit-loss.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\ProfitLossController::class, 'index'])->name('index');
        Route::get('export', [\App\Http\Controllers\Admin\ProfitLossController::class, 'export'])->name('export');
    });

    Route::prefix('admins')->name('admins.')->group(function () {
        Route::resource('/', \App\Http\Controllers\Admin\Admin\AdminController::class)->only([
            'index',
            'store',
            'update',
        ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
        Route::post('action/{action}', [\App\Http\Controllers\Admin\Admin\AdminController::class, 'action'])
            ->whereIn('action', ['trash', 'restore', 'destroy'])
            ->name('action');
        Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\Admin\AdminController::class, 'switch'])
            ->whereIn('columnName', ['status', 'admin_group_id'])->name('switch');
        Route::get('options', [\App\Http\Controllers\Admin\Admin\AdminController::class, 'options'])->name('options');

        Route::prefix('groups')->name('groups.')->group(function () {
            Route::resource('', \App\Http\Controllers\Admin\Admin\GroupController::class)->only([
                'index',
                'store',
                'update',
            ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
            Route::post('action/{action}', [\App\Http\Controllers\Admin\Admin\GroupController::class, 'action'])
                ->whereIn('action', ['trash', 'restore', 'destroy'])
                ->name('action');
            Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\Admin\GroupController::class, 'switch'])
                ->whereIn('columnName', ['is_api_access_enabled'])->name('switch');
        });
    });

    Route::prefix('users')->name('users.')->group(function () {
        Route::resource('/', \App\Http\Controllers\Admin\User\UserController::class)->only([
            'index',
            'store',
            'update',
        ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
        // Route::get('detail/{target:id}', [\App\Http\Controllers\Admin\User\UserController::class, 'show'])->name('show');
        Route::post('action/{action}', [\App\Http\Controllers\Admin\User\UserController::class, 'action'])
            ->whereIn('action', ['trash', 'restore', 'destroy'])
            ->name('action');
        Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\User\UserController::class, 'switch'])
            ->whereIn('columnName', ['status', 'user_group_id'])->name('switch');
        Route::get('options', [\App\Http\Controllers\Admin\User\UserController::class, 'options'])->name('options');
        Route::post('balance-reduction', [\App\Http\Controllers\Admin\User\UserController::class, 'balanceReduction'])->name('balance-reduction');

        Route::prefix('groups')->name('groups.')->group(function () {
            Route::resource('', \App\Http\Controllers\Admin\User\GroupController::class)->only([
                'index',
                'store',
                'update',
            ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
            Route::post('action/{action}', [\App\Http\Controllers\Admin\User\GroupController::class, 'action'])
                ->whereIn('action', ['trash', 'restore', 'destroy'])
                ->name('action');
            Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\User\GroupController::class, 'switch'])
                ->whereIn('columnName', ['is_api_access_enabled'])->name('switch');
        });
    });

    Route::prefix('services')->name('services.')->group(function () {
        Route::put('/update-batch-description', [\App\Http\Controllers\Admin\Service\ServiceController::class, 'updateBatchDescription'])->name('update-batch-description');
        Route::put('/update-batch-category', [\App\Http\Controllers\Admin\Service\ServiceController::class, 'updateBatchCategory'])->name('update-batch-category');
        Route::resource('/', \App\Http\Controllers\Admin\Service\ServiceController::class)->only([
            'index',
            'store',
            'update',
        ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
        Route::get('detail/{target:id}', [\App\Http\Controllers\Admin\Service\ServiceController::class, 'show'])->name('show');
        Route::post('action/{action}', [\App\Http\Controllers\Admin\Service\ServiceController::class, 'action'])
            ->whereIn('action', ['trash', 'restore', 'destroy'])
            ->name('action');
        Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\Service\ServiceController::class, 'switch'])
            ->whereIn('columnName', ['status', 'is_recommended', 'is_best_seller'])->name('switch');
        Route::get('options', [\App\Http\Controllers\Admin\Service\ServiceController::class, 'options'])->name('options');
        Route::post('sort', [\App\Http\Controllers\Admin\Service\ServiceController::class, 'sort'])->name('sort');
        Route::post('fetch', [\App\Http\Controllers\Admin\Service\ServiceController::class, 'fetch'])->name('fetch');
        Route::get('updates', \App\Http\Controllers\Admin\Service\UpdateController::class)->name('updates');
        Route::get('monitoring', \App\Http\Controllers\Admin\Service\MonitoringController::class)->name('monitoring');

        Route::prefix('fetch')->name('fetch.')->group(function () {
            // Fetch Service Single
            Route::get('single', [\App\Http\Controllers\Admin\Service\Fetch\FetchServiceSingleController::class, 'index'])->name('single.index');
            Route::get('single/list-category/{provider}', [\App\Http\Controllers\Admin\Service\Fetch\FetchServiceSingleController::class, 'listCategory'])->name('single.list-category');
            Route::post('single/services', [\App\Http\Controllers\Admin\Service\Fetch\FetchServiceSingleController::class, 'fetchServices'])->name('single.fetch-services');
            Route::post('single/store', [\App\Http\Controllers\Admin\Service\Fetch\FetchServiceSingleController::class, 'storeService'])->name('single.store');
            Route::post('single/store-bulk', [\App\Http\Controllers\Admin\Service\Fetch\FetchServiceSingleController::class, 'storeBulk'])->name('single.store-bulk');

            // Fetch Service Cat on Cat
            Route::get('cat-on-cat', [\App\Http\Controllers\Admin\Service\Fetch\FetchServiceCatOnCatController::class, 'index'])->name('cat-on-cat.index');
            Route::get('cat-on-cat/list-category/{provider}', [\App\Http\Controllers\Admin\Service\Fetch\FetchServiceCatOnCatController::class, 'listCategory'])->name('cat-on-cat.list-category');
            Route::post('cat-on-cat/import', [\App\Http\Controllers\Admin\Service\Fetch\FetchServiceCatOnCatController::class, 'processImport'])->name('cat-on-cat.import');

            // Fetch Service Massal By Category
            Route::get('massal-by-category', [\App\Http\Controllers\Admin\Service\Fetch\FetchServiceMassalByCategoryController::class, 'index'])->name('massal-by-category.index');
            Route::get('massal-by-category/list-category/{provider}', [\App\Http\Controllers\Admin\Service\Fetch\FetchServiceMassalByCategoryController::class, 'listCategory'])->name('massal-by-category.list-category');
            Route::post('massal-by-category/import', [\App\Http\Controllers\Admin\Service\Fetch\FetchServiceMassalByCategoryController::class, 'processImport'])->name('massal-by-category.import');

            // Fetch Service Massal
            Route::get('massal', [\App\Http\Controllers\Admin\Service\Fetch\FetchServiceMassalController::class, 'index'])->name('massal.index');
            Route::post('massal/import', [\App\Http\Controllers\Admin\Service\Fetch\FetchServiceMassalController::class, 'processImport'])->name('massal.import');

            // Get Services (multi-step wizard)
            Route::get('get-services', [\App\Http\Controllers\Admin\Service\Fetch\GetServicesController::class, 'index'])->name('get-services.index');
            Route::post('get-services/fetch', [\App\Http\Controllers\Admin\Service\Fetch\GetServicesController::class, 'fetchServices'])->name('get-services.fetch');
            Route::post('get-services/import', [\App\Http\Controllers\Admin\Service\Fetch\GetServicesController::class, 'importServices'])->name('get-services.import');
        });

        Route::prefix('categories')->name('categories.')->group(function () {
            Route::resource('', \App\Http\Controllers\Admin\Service\Category\CategoryController::class)->only([
                'index',
                'store',
                'update',
            ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
            Route::post('action/{action}', [\App\Http\Controllers\Admin\Service\Category\CategoryController::class, 'action'])
                ->whereIn('action', ['trash', 'restore', 'destroy'])
                ->name('action');
            Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\Service\Category\CategoryController::class, 'switch'])
                ->whereIn('columnName', ['status', 'service_category_group_id', 'type'])->name('switch');
            Route::get('options', [\App\Http\Controllers\Admin\Service\Category\CategoryController::class, 'options'])->name('options');
            Route::post('sort', [\App\Http\Controllers\Admin\Service\Category\CategoryController::class, 'sort'])->name('sort');

            Route::prefix('groups')->name('groups.')->group(function () {
                Route::resource('', \App\Http\Controllers\Admin\Service\Category\GroupController::class)->only([
                    'index',
                    'store',
                    'update',
                ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
                Route::post('action/{action}', [\App\Http\Controllers\Admin\Service\Category\GroupController::class, 'action'])
                    ->whereIn('action', ['trash', 'restore', 'destroy'])
                    ->name('action');
                Route::get('options', [\App\Http\Controllers\Admin\Service\Category\GroupController::class, 'options'])->name('options');
                Route::post('sort', [\App\Http\Controllers\Admin\Service\Category\GroupController::class, 'sort'])->name('sort');
            });
        });

        Route::prefix('custom-prices')->name('custom-prices.')->group(function () {
            Route::resource('', \App\Http\Controllers\Admin\Service\CustomPriceController::class)->only([
                'index',
                'store',
                'update',
            ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
            Route::post('action/{action}', [\App\Http\Controllers\Admin\Service\CustomPriceController::class, 'action'])
                ->whereIn('action', ['trash', 'restore', 'destroy'])
                ->name('action');
            Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\Service\CustomPriceController::class, 'switch'])
                ->whereIn('columnName', ['status', 'user_group_id'])->name('switch');
            Route::get('options', [\App\Http\Controllers\Admin\Service\CustomPriceController::class, 'options'])->name('options');
            Route::post('sort', [\App\Http\Controllers\Admin\Service\CustomPriceController::class, 'sort'])->name('sort');
            Route::post('{target:id}/check-balance', [\App\Http\Controllers\Admin\Service\CustomPriceController::class, 'checkBalance'])->name('check-balance');
        });

        Route::prefix('providers')->name('providers.')->group(function () {
            Route::resource('', \App\Http\Controllers\Admin\Service\ProviderController::class)->only([
                'index',
                'store',
                'update',
            ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
            Route::post('action/{action}', [\App\Http\Controllers\Admin\Service\ProviderController::class, 'action'])
                ->whereIn('action', ['trash', 'restore', 'destroy'])
                ->name('action');
            Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\Service\ProviderController::class, 'switch'])
                ->whereIn('columnName', ['status'])->name('switch');
            Route::get('options', [\App\Http\Controllers\Admin\Service\ProviderController::class, 'options'])->name('options');
            Route::post('sort', [\App\Http\Controllers\Admin\Service\ProviderController::class, 'sort'])->name('sort');
            Route::post('{target:id}/check-balance', [\App\Http\Controllers\Admin\Service\ProviderController::class, 'checkBalance'])->name('check-balance');
            Route::get('response', [\App\Http\Controllers\Admin\Service\Provider\ResponseController::class, 'index'])->name('response');
        });
    });

    Route::prefix('orders')->name('orders.')->group(function () {
        Route::resource('/', \App\Http\Controllers\Admin\Order\OrderController::class)->only([
            'index',
            'store',
            'update',
        ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
        Route::post('action/{action}', [\App\Http\Controllers\Admin\Order\OrderController::class, 'action'])
            ->whereIn('action', ['trash', 'restore', 'destroy'])
            ->name('action');
        Route::put('/update-batch', [\App\Http\Controllers\Admin\Order\OrderController::class, 'update'])->name('update-batch');
        Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\Order\OrderController::class, 'switch'])
            ->whereIn('columnName', ['status'])->name('switch');
        Route::get('refills', [\App\Http\Controllers\Admin\Order\RefillController::class, 'index'])->name('refills.index');
        Route::post('refills', [\App\Http\Controllers\Admin\Order\RefillController::class, 'store'])->name('refills.store');
        Route::post('cancels', [\App\Http\Controllers\Admin\Order\CancelController::class, 'store'])->name('cancels.store');
        Route::get('reviews', [\App\Http\Controllers\Admin\Order\ReviewController::class, 'index'])->name('reviews.index');
        Route::post('reviews/switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\Order\ReviewController::class, 'switch'])
            ->whereIn('columnName', ['status', 'is_read_admin'])->name('reviews.switch');
        Route::get('report', [\App\Http\Controllers\Admin\Order\OrderController::class, 'report'])->name('report');
    });

    Route::prefix('deposits')->name('deposits.')->group(function () {
        Route::resource('/', \App\Http\Controllers\Admin\DepositController::class)->only([
            'index',
            'store',
            'update',
        ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
        Route::post('switch/{target:id}/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\DepositController::class, 'switch'])
            ->whereIn('columnName', \App\Enums\Deposit\Deposit::getValue('ARRAY_ENABLED_COLUMN_NAME_SWITCH'))
            ->whereIn('columnValue', \App\Enums\Deposit\Deposit::getValue('ARRAY_ENABLED_COLUMN_VALUE_SWITCH'))->name('switch');
        Route::get('report', [\App\Http\Controllers\Admin\DepositController::class, 'report'])->name('report');
    });

    Route::prefix('tickets')->name('tickets.')->group(function () {
        Route::resource('/', \App\Http\Controllers\Admin\TicketController::class)->except([
            'create',
            'store',
            'show',
            'edit',
            'destroy'
        ])->parameters(['' => 'target'])->scoped(['target' => 'id']);
        Route::get('reply/{target:id}', [\App\Http\Controllers\Admin\TicketController::class, 'edit'])->name('edit');
        Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\TicketController::class, 'switch'])
            ->whereIn('columnName', ['status'])->name('switch');
    });

    Route::prefix('payment-methods')->name('payment-methods.')->group(function () {
        Route::resource('/', \App\Http\Controllers\Admin\PaymentMethodController::class)->only([
            'index',
            'store',
            'update',
        ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
        Route::post('action/{action}', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'action'])
            ->whereIn('action', ['trash', 'restore', 'destroy'])
            ->name('action');
        Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'switch'])
            ->whereIn('columnName', ['status', 'type'])->name('switch');
        Route::get('options', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'options'])->name('options');
        Route::post('sort', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'sort'])->name('sort');
    });

    Route::prefix('logs')->name('logs.')->group(function () {
        Route::prefix('admins')->name('admins.')->group(function () {
            Route::get('activity', [\App\Http\Controllers\Admin\Log\AdminController::class, 'activity'])->name('activity');
            Route::get('signin', [\App\Http\Controllers\Admin\Log\AdminController::class, 'signin'])->name('signin');
        });
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('activity', [\App\Http\Controllers\Admin\Log\UserController::class, 'activity'])->name('activity');
            Route::get('signin', [\App\Http\Controllers\Admin\Log\UserController::class, 'signin'])->name('signin');
            Route::get('signup', [\App\Http\Controllers\Admin\Log\UserController::class, 'signup'])->name('signup');
            Route::get('balance', [\App\Http\Controllers\Admin\Log\UserController::class, 'balance'])->name('balance');
        });
    });



    Route::prefix('websites')->name('websites.')->group(function () {
        Route::prefix('blogs')->name('blogs.')->group(function () {
            Route::resource('/', \App\Http\Controllers\Admin\Website\BlogController::class)->only([
                'index',
                'store',
                'update',
            ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
            Route::post('action/{action}', [\App\Http\Controllers\Admin\Website\BlogController::class, 'action'])
                ->whereIn('action', ['trash', 'restore', 'destroy'])
                ->name('action');
            Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\Website\BlogController::class, 'switch'])
                ->whereIn('columnName', ['status'])->name('switch');
            Route::get('options', [\App\Http\Controllers\Admin\Website\BlogController::class, 'options'])->name('options');
            Route::post('sort', [\App\Http\Controllers\Admin\Website\BlogController::class, 'sort'])->name('sort');
        });
        Route::prefix('news')->name('news.')->group(function () {
            Route::resource('/', \App\Http\Controllers\Admin\Website\NewsController::class)->only([
                'index',
                'store',
                'update',
            ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
            Route::post('action/{action}', [\App\Http\Controllers\Admin\Website\NewsController::class, 'action'])
                ->whereIn('action', ['trash', 'restore', 'destroy'])
                ->name('action');
            Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\Website\NewsController::class, 'switch'])
                ->whereIn('columnName', ['status'])->name('switch');
            Route::get('options', [\App\Http\Controllers\Admin\Website\NewsController::class, 'options'])->name('options');
            Route::post('sort', [\App\Http\Controllers\Admin\Website\NewsController::class, 'sort'])->name('sort');
        });
        Route::prefix('sitemaps')->name('sitemaps.')->group(function () {
            Route::resource('/', \App\Http\Controllers\Admin\Website\SitemapController::class)->only([
                'index',
                'store',
                'update',
            ])->parameters(['' => 'target'])->scoped(['target' => 'id'])->withTrashed(['destroy']);
            Route::post('action/{action}', [\App\Http\Controllers\Admin\Website\SitemapController::class, 'action'])
                ->whereIn('action', ['trash', 'restore', 'destroy'])
                ->name('action');
            Route::post('switch/{columnName}/{columnValue}', [\App\Http\Controllers\Admin\Website\SitemapController::class, 'switch'])
                ->whereIn('columnName', ['status'])->name('switch');
            Route::get('options', [\App\Http\Controllers\Admin\Website\SitemapController::class, 'options'])->name('options');
            Route::post('sort', [\App\Http\Controllers\Admin\Website\SitemapController::class, 'sort'])->name('sort');
        });

        Route::prefix('configs')->name('configs.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\Website\ConfigurationController::class, 'index'])->name('index');
            Route::patch('/', [\App\Http\Controllers\Admin\Website\ConfigurationController::class, 'update'])->middleware(['precognitive'])->name('update');
            Route::delete('{columnKey}/{columnValue}', [\App\Http\Controllers\Admin\Website\ConfigurationController::class, 'destroy'])
                ->whereIn('columnName', ['website', 'banner'])->name('destroy');
        });
    });
});

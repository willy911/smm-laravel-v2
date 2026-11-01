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

use Illuminate\Support\Facades\Route;

Route::post('payment-method/detail/{target:id}', [\App\Http\Controllers\AJAX\PaymentMethodController::class, 'show'])->name('payment-method.show');
Route::prefix('services')->name('services.')->group(function () {
    Route::post('/', [\App\Http\Controllers\AJAX\ServiceController::class, 'index'])->name('index');
    Route::post('/search', [\App\Http\Controllers\AJAX\ServiceController::class, 'search'])->name('search')->middleware('auth');
    Route::post('/detail/{target:id}', [\App\Http\Controllers\AJAX\ServiceController::class, 'show'])->name('show');
    Route::post('/favorite/{type}', [\App\Http\Controllers\AJAX\ServiceController::class, 'favorite'])
        ->whereIn('type', ['add', 'remove'])
        ->name('favorite')->middleware('auth');
});
Route::prefix('services/categories')->name('services.categories.')->group(function () {
    Route::post('/', [\App\Http\Controllers\AJAX\ServiceCategoryController::class, 'index'])->name('index');
});
Route::prefix('orders')->name('orders.')->group(function () {
    Route::post('refills', [\App\Http\Controllers\AJAX\OrderController::class, 'storeRefill'])->name('refills.store')->middleware('auth');
    Route::post('cancels', [\App\Http\Controllers\AJAX\OrderController::class, 'storeCancel'])->name('cancels.store')->middleware('auth');
});

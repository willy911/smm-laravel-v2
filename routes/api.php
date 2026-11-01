<?php

use App\Models\Service\Service;
use Carbon\CarbonInterval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('account/profile', \App\Http\Controllers\API\ProfileController::class)->middleware('api');
Route::post('services', \App\Http\Controllers\API\ServiceController::class)->middleware('api');
Route::post('order/create', [\App\Http\Controllers\API\OrderController::class, 'create'])->middleware('api');
Route::post('order/status', [\App\Http\Controllers\API\OrderController::class, 'status'])->middleware('api');
Route::post('order/refill/create', [\App\Http\Controllers\API\OrderRefillController::class, 'create'])->middleware('api');
Route::post('order/refill/status', [\App\Http\Controllers\API\OrderRefillController::class, 'status'])->middleware('api');
Route::post('order/cancel/create', [\App\Http\Controllers\API\OrderCancelController::class, 'create'])->middleware('api');

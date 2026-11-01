<?php

use App\Install\Controllers\InstallController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function () {
    Route::get('/install', [InstallController::class, 'welcome']);
    Route::get('/install/requirements', [InstallController::class, 'requirements']);
    Route::get('/install/setup', [InstallController::class, 'setup']);
    Route::post('/install/process', [InstallController::class, 'process']);
    Route::get('/install/finish', [InstallController::class, 'finish']);
});

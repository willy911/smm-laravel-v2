<?php

use App\Models\Deposit\Deposit;
use App\Models\Order\Order;
use App\Models\Order\OrderRefill;
use App\Models\Service\ServiceProvider;
use App\Models\Service\ServiceUpdate;
use App\Models\User\UserActivityLog;
use App\Models\User\UserBalanceLog;
use App\Models\User\UserSigninLog;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('order:send-order')->everyTenSeconds()->withoutOverlapping();
Schedule::command('order:status-order')->everyTenSeconds()->withoutOverlapping();
Schedule::command('order:status-order-refill')->everyMinute()->withoutOverlapping();
Schedule::command('service:sync-service')->everyThirtyMinutes()->withoutOverlapping();
Schedule::command('deposit:cancel-deposit')->everyTenMinutes()->withoutOverlapping();

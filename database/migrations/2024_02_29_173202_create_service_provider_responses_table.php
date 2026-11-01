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

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_provider_responses', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['account_profile', 'order_create', 'order_status', 'order_cancel_create', 'order_refill_create', 'order_refill_status', 'fetch_services']);
            $table->enum('status', ['success', 'fail']);
            $table->foreignId('user_id')->nullable();
            $table->foreignId('order_id')->nullable();
            $table->foreignId('order_refill_id')->nullable();
            $table->foreignId('order_cancel_id')->nullable();
            $table->foreignId('service_id')->nullable();
            $table->foreignId('service_provider_id');
            $table->json('logs');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_provider_responses');
    }
};

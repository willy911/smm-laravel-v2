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
        Schema::create('service_provider_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_provider_id');
            $table->json('account_configuration');
            $table->json('services_configuration');
            $table->json('order_create_configuration');
            $table->json('order_status_configuration');
            $table->json('order_cancel_create_configuration')->nullable();
            $table->json('order_refill_create_configuration')->nullable();
            $table->json('order_refill_status_configuration')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_provider_configurations');
    }
};

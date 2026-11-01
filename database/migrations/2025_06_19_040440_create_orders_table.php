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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->foreignId('service_provider_id');
            $table->foreignId('service_id');
            $table->string('service_name', 500);
            $table->string('target', 500);
            $table->double('quantity')->default(0);
            $table->decimal('price', 15, 8)->default(0);
            $table->decimal('profit', 15, 8)->default(0);
            $table->double('start_count')->default(0);
            $table->double('remains')->default(0);
            $table->enum('status', ['completed', 'pending', 'processing', 'in_progress', 'error', 'partial', 'canceled'])->default('pending');
            $table->string('service_provider_status')->nullable();
            $table->string('service_provider_order_id')->nullable();
            $table->json('service_provider_order_log')->nullable();
            $table->json('service_provider_status_log')->nullable();
            $table->json('additional_input')->nullable();
            $table->ipAddress()->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->enum('ordered_via', ['web', 'api'])->default('web');
            $table->boolean('is_refunded')->default(false);
            $table->boolean('is_sent')->default(false);
            $table->decimal('initial_balance', 15, 8)->default(0);
            $table->decimal('final_balance', 15, 8)->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

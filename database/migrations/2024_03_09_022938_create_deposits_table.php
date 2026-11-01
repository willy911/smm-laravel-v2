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
        Schema::create('deposits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->foreignId('payment_method_id');
            $table->string('payment_method_name');
            $table->string('sender')->nullable();
            $table->decimal('amount', 15, 8)->default(0);
            $table->decimal('bonus', 15, 8)->default(0);
            $table->decimal('admin_fee', 15, 8)->default(0);
            $table->decimal('unique_code', 15, 8)->default(0);
            $table->decimal('total_payment', 15, 8)->default(0);
            $table->decimal('total_balance', 15, 8)->default(0);
            $table->boolean('is_manual')->default(false);
            $table->enum('status', ['success', 'pending', 'canceled', 'expired'])->default('pending');
            $table->text('payment_information')->nullable();
            $table->string('payment_gateway_payment_id')->nullable();
            $table->string('payment_gateway_payment_token')->nullable();
            $table->string('payment_gateway_checkout_url')->nullable();
            $table->json('payment_gateway_api_log')->nullable();
            $table->ipAddress()->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->decimal('initial_balance', 15, 8)->default(0);
            $table->decimal('final_balance', 15, 8)->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deposits');
    }
};

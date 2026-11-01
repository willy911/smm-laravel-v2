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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('sort_number')->nullable();
            $table->enum('type', ['crypto', 'transfer_bank', 'virtual_account', 'e_wallet', 'qris', 'convenience_store', 'other']);
            $table->string('payment_gateway')->nullable();
            $table->string('payment_gateway_payment_code')->nullable();
            $table->string('payment_target', 500)->nullable();
            $table->json('payment_instruction')->nullable();
            $table->string('name');
            $table->decimal('minimum', 15, 8);
            $table->decimal('maximum', 15, 8);
            $table->json('admin_fee_configs')->nullable();
            $table->json('bonus_configs')->nullable();
            $table->string('logo')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->timestamp('deleted_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};

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
        Schema::create('user_balance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->enum('type', ['credit', 'debit'])->default('debit');
            $table->enum('category', ['order', 'commission', 'deposit', 'other']);
            $table->decimal('amount', 15, 8)->default(0);
            $table->string('content_key')->nullable();
            $table->json('content_params')->nullable();
            $table->decimal('initial_balance', 15, 8)->default(0);
            $table->decimal('final_balance', 15, 8)->default(0);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_balance_logs');
    }
};

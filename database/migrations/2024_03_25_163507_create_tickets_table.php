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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->enum('department', ['order', 'deposit', 'other'])->default('order');
            $table->text('data_id')->nullable();
            $table->string('request')->nullable();
            $table->string('subject');
            $table->enum('status', ['open', 'answered', 'user_reply', 'closed'])->default('open');
            $table->boolean('is_read_user')->default(true);
            $table->boolean('is_read_admin')->default(false);
            $table->ipAddress()->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};

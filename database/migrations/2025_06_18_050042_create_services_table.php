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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('sort_number')->nullable();
            $table->foreignId('service_category_id')->nullable();
            $table->foreignId('service_provider_id');
            $table->foreignId('service_provider_service_id');
            $table->string('service_label_id')->nullable();
            $table->string('name', 500);
            $table->decimal('original_price', 15, 8)->default(0);
            $table->decimal('price', 15, 8)->default(0);
            $table->decimal('profit', 15, 8)->default(0);
            $table->double('min')->default(0);
            $table->double('max')->default(0);
            $table->text('description')->nullable();
            $table->string('type')->default('primary');
            $table->json('settings')->nullable();
            $table->boolean('is_refill_support')->default(false);
            $table->boolean('is_cancel_support')->default(false);
            $table->boolean('is_auto_update_price')->default(true);
            $table->boolean('is_manual_profit')->default(false);
            $table->boolean('is_recommended')->default(false);
            $table->boolean('is_best_seller')->default(false);
            $table->unsignedSmallInteger('refill_days')->default(30);
            $table->unsignedTinyInteger('refill_available_in_hours')->default(1);
            $table->boolean('status')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->timestamp('deleted_at')->nullable();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};

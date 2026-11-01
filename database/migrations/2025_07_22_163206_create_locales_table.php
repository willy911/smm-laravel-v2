<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('locales', function (Blueprint $table) {
            $table->id();
            $table->string('currency_code', 3);
            $table->string('currency_symbol', 10);
            $table->string('language_name', 100);
            $table->decimal('usd_rate', 15, 6)->default(1);
            $table->string('locale', 5)->default('id');
            $table->string('locale_code', 10);
            $table->unsignedTinyInteger('max_decimal_digits')->default(4);
            $table->string('decimal_separator', 1)->default('.');
            $table->string('thousand_separator', 1)->default(',');
            $table->json('translations')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->timestamp('deleted_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locales');
    }
};

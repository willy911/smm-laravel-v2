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
        Schema::table('locales', function (Blueprint $table) {
            $table->decimal('usd_rate_buy', 14, 6)->nullable();
            $table->decimal('kurs_tengah', 14, 6)->nullable();
            $table->string('kurs_source', 100)->nullable();
            $table->timestamp('kurs_synced_at')->nullable();
            $table->tinyInteger('kurs_auto')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('locales', function (Blueprint $table) {
            $table->dropColumn(['usd_rate_buy', 'kurs_tengah', 'kurs_source', 'kurs_synced_at', 'kurs_auto']);
        });
    }
};

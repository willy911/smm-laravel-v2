<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom type + flag support (refill/cancel) ke tabel staging
     * service_provider_services. Nullable agar baris lama (sebelum sinkron
     * pertama dengan field baru) tidak bermasalah — SyncServicesFromProviderJob
     * hanya membandingkan bila staging nilainya bukan NULL.
     */
    public function up(): void
    {
        Schema::table('service_provider_services', function (Blueprint $table) {
            $table->string('type')->nullable()->after('description');
            $table->boolean('is_refill_support')->nullable()->after('type');
            $table->boolean('is_cancel_support')->nullable()->after('is_refill_support');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_provider_services', function (Blueprint $table) {
            $table->dropColumn(['type', 'is_refill_support', 'is_cancel_support']);
        });
    }
};

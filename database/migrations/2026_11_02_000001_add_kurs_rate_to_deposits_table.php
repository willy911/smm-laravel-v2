<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Simpan kurs (IDR per USD) yang dipakai saat deposit dibuat, agar
     * nilai konversi tiap deposit dapat diaudit dari kurs historisnya.
     */
    public function up(): void
    {
        Schema::table('deposits', function (Blueprint $table) {
            $table->decimal('kurs_rate', 14, 6)->nullable()->after('total_balance');
        });
    }

    public function down(): void
    {
        Schema::table('deposits', function (Blueprint $table) {
            $table->dropColumn('kurs_rate');
        });
    }
};

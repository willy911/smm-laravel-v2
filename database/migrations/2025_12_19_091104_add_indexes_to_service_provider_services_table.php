<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_provider_services', function (Blueprint $table) {
            $table->unique(
                ['service_provider_id', 'service_provider_service_id'],
                'sp_service_index'
            );
        });
    }

    public function down(): void
    {
        Schema::table('service_provider_services', function (Blueprint $table) {
            $table->dropUnique('sp_service_index');
        });
    }
};

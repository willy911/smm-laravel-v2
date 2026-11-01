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
        Schema::table('service_updates', function (Blueprint $table) {
            $table->index('service_id');
            $table->index('created_at');
            $table->index('type');
            // $table->index('description');
            $table->index(['service_id', 'created_at']);
            $table->index(['type', 'created_at']);
            $table->index(['service_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_updates', function (Blueprint $table) {
            $table->dropIndex(['service_id']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['type']);
            // $table->dropIndex(['description']);
            $table->dropIndex(['service_id', 'created_at']);
            $table->dropIndex(['type', 'created_at']);
            $table->dropIndex(['service_id', 'type']);
        });
    }
};

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
        Schema::table('services', function (Blueprint $table) {
            $table->index('sort_number');
            $table->index('service_category_id');
            $table->index('service_provider_id');
            $table->index('service_provider_service_id');
            $table->index('original_price');
            $table->index('price');
            $table->index('profit');
            $table->index('min');
            $table->index('max');
            $table->index('type');
            $table->index('created_at');
            $table->index('updated_at');
            $table->index('deleted_at');
            $table->index(['id', 'deleted_at']);
            $table->index(['deleted_at', 'status', 'created_at']);
            $table->index(['deleted_at', 'status', 'updated_at']);
            $table->index(['deleted_at', 'status', 'service_category_id']);
            $table->index(['deleted_at', 'status', 'type']);
            $table->index(['deleted_at', 'status', 'service_category_id', 'created_at']);
            $table->index(['deleted_at', 'status', 'service_category_id', 'updated_at']);
            $table->index(['deleted_at', 'status', 'service_category_id', 'type']);
            $table->index(['deleted_at', 'status', 'type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex(['sort_number']);
            $table->dropIndex(['service_category_id']);
            $table->dropIndex(['service_provider_id']);
            $table->dropIndex(['service_provider_service_id']);
            $table->dropIndex(['original_price']);
            $table->dropIndex(['price']);
            $table->dropIndex(['profit']);
            $table->dropIndex(['min']);
            $table->dropIndex(['max']);
            $table->dropIndex(['type']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['updated_at']);
            $table->dropIndex(['deleted_at']);
            $table->dropIndex(['id', 'deleted_at']);
            $table->dropIndex(['deleted_at', 'status', 'created_at']);
            $table->dropIndex(['deleted_at', 'status', 'updated_at']);
            $table->dropIndex(['deleted_at', 'status', 'service_category_id']);
            $table->dropIndex(['deleted_at', 'status', 'type']);
            $table->dropIndex(['deleted_at', 'status', 'service_category_id', 'created_at']);
            $table->dropIndex(['deleted_at', 'status', 'service_category_id', 'updated_at']);
            $table->dropIndex(['deleted_at', 'status', 'service_category_id', 'type']);
            $table->dropIndex(['deleted_at', 'status', 'type', 'created_at']);
        });
    }
};

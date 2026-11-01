<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('service_provider_id');
            $table->index('service_provider_order_id');
            $table->index('service_id');
            $table->index('service_name');
            $table->index('target');
            $table->index('quantity');
            $table->index('start_count');
            $table->index('remains');
            $table->index('created_at');
            $table->index('updated_at');
            $table->index('status');
            $table->index('ordered_via');
            $table->index(['user_id', 'id']);
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'updated_at']);
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'service_id']);
            $table->index(['user_id', 'ordered_via']);
            $table->index(['user_id', 'status', 'price']);
            $table->index(['user_id', 'created_at', 'status']);
            $table->index(['user_id', 'status', 'service_id']);
            $table->index(['service_id', 'status', 'id']);
            $table->index(['user_id', 'created_at', 'service_id']);
            $table->index(['user_id', 'status', 'ordered_via']);
            $table->index(['user_id', 'target']);
            $table->index(['service_id', 'status', 'id', 'quantity', 'created_at', 'updated_at']);
            $table->index(['user_id', 'created_at', 'status', 'price']);
            $table->index(['user_id', 'updated_at', 'status', 'price']);
            $table->index(['user_id', 'created_at', 'id']);
            $table->index(['user_id', 'updated_at', 'id']);
            $table->index(['user_id', 'ordered_via', 'status', 'price']);
            $table->index(['user_id', 'price', 'id']);
            $table->index(['status', 'created_at']);
            $table->index(['status', 'created_at', 'service_id', 'price']);
            $table->index(['user_id', 'status', 'created_at', 'price']);
            $table->index(['status', 'created_at', 'service_id', 'service_name', 'price']);
            $table->index(['user_id', 'status', 'price', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['service_provider_id']);
            $table->dropIndex(['service_provider_order_id']);
            $table->dropIndex(['service_id']);
            $table->dropIndex(['service_name']);
            $table->dropIndex(['target']);
            $table->dropIndex(['quantity']);
            $table->dropIndex(['start_count']);
            $table->dropIndex(['remains']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['updated_at']);
            $table->dropIndex(['status']);
            $table->dropIndex(['ordered_via']);
            $table->dropIndex(['user_id', 'id']);
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['user_id', 'updated_at']);
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex(['user_id', 'service_id']);
            $table->dropIndex(['user_id', 'ordered_via']);
            $table->dropIndex(['user_id', 'created_at', 'status']);
            $table->dropIndex(['user_id', 'status', 'service_id']);
            $table->dropIndex(['user_id', 'created_at', 'service_id']);
            $table->dropIndex(['user_id', 'status', 'ordered_via']);
            $table->dropIndex(['user_id', 'status', 'price']);
            $table->dropIndex(['service_id', 'status', 'id']);
            $table->dropIndex(['user_id', 'target']);
            $table->dropIndex(['service_id', 'status', 'id', 'quantity', 'created_at', 'updated_at']);
            $table->dropIndex(['user_id', 'created_at', 'status', 'price']);
            $table->dropIndex(['user_id', 'updated_at', 'status', 'price']);
            $table->dropIndex(['user_id', 'created_at', 'id']);
            $table->dropIndex(['user_id', 'updated_at', 'id']);
            $table->dropIndex(['user_id', 'ordered_via', 'status', 'price']);
            $table->dropIndex(['user_id', 'price', 'id']);
            $table->dropIndex(['status', 'created_at']);
            $table->dropIndex(['status', 'created_at', 'service_id', 'price']);
            $table->dropIndex(['user_id', 'status', 'created_at', 'price']);
            $table->dropIndex(['status', 'created_at', 'service_id', 'service_name', 'price']);
            $table->dropIndex(['user_id', 'status', 'price', 'created_at']);
        });
    }
};

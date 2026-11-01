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
        Schema::table('deposits', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('amount');
            $table->index('bonus');
            $table->index('admin_fee');
            $table->index('total_payment');
            $table->index('total_balance');
            $table->index('payment_method_id');
            $table->index('created_at');
            $table->index('updated_at');
            $table->index('status');
            $table->index('payment_gateway_payment_id');
            $table->index(['user_id', 'id']);
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'updated_at']);
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'payment_method_id']);
            $table->index(['user_id', 'status', 'amount']);
            $table->index(['user_id', 'created_at', 'status']);
            $table->index(['user_id', 'status', 'payment_method_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deposits', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['amount']);
            $table->dropIndex(['bonus']);
            $table->dropIndex(['admin_fee']);
            $table->dropIndex(['total_payment']);
            $table->dropIndex(['total_balance']);
            $table->dropIndex(['payment_method_id']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['updated_at']);
            $table->dropIndex(['status']);
            $table->dropIndex(['user_id', 'id']);
            $table->dropIndex(['payment_gateway_payment_id']);
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['user_id', 'updated_at']);
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex(['user_id', 'payment_method_id']);
            $table->dropIndex(['user_id', 'status', 'amount']);
            $table->dropIndex(['user_id', 'created_at', 'status']);
            $table->dropIndex(['user_id', 'status', 'payment_method_id']);
        });
    }
};

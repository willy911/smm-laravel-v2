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
        Schema::table('user_balance_logs', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('amount');
            $table->index('created_at');
            $table->index('type');
            $table->index('category');
            // $table->index('content');
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'category']);
            $table->index(['user_id', 'type', 'amount']);
            $table->index(['user_id', 'type', 'created_at']);
            $table->index(['user_id', 'category', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_balance_logs', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['amount']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['type']);
            $table->dropIndex(['category']);
            // $table->dropIndex(['content']);
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['user_id', 'type']);
            $table->dropIndex(['user_id', 'category']);
            $table->dropIndex(['user_id', 'type', 'amount']);
            $table->dropIndex(['user_id', 'type', 'created_at']);
            $table->dropIndex(['user_id', 'category', 'created_at']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Skema mengikuti PRD §6 (port dari smm 2024_02_28_175732 + unique index
     * 2026_10_12 + kolom is_read_admin yang ada di DB smdemo).
     */
    public function up(): void
    {
        Schema::create('order_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->foreignId('order_id');
            $table->foreignId('service_id');
            $table->double('rating')->default('0');
            $table->longText('message')->nullable();
            $table->enum('is_read_admin', ['0', '1'])->default('0');
            $table->enum('status', ['0', '1'])->default('0');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->timestamp('deleted_at')->nullable();
            $table->unique(['user_id', 'service_id'], 'order_reviews_user_service_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_reviews');
    }
};

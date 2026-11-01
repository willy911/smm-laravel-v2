<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mobile_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('payment');
            $table->decimal('amount', 15, 8)->default(0);
            $table->text('content');
            $table->boolean('is_used')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mobile_notifications');
    }
};

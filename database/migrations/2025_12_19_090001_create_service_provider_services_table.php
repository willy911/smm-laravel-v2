<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_provider_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_provider_id');
            $table->bigInteger('service_provider_service_id');
            $table->decimal('original_price', 15, 8)->default(0);
            $table->decimal('price', 15, 8)->default(0);
            $table->decimal('profit', 15, 8)->default(0);
            $table->double('min')->default(0);
            $table->double('max')->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_provider_services');
    }
};

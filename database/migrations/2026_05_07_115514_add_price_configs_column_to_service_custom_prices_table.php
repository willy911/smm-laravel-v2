<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_custom_prices', function (Blueprint $table) {
            $table->json('price_configs')->after('service_category_id')->nullable();
            $table->dropColumn([
                'price',
                'profit',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('service_custom_prices', function (Blueprint $table) {
            $table->dropColumn('price_configs');
            $table->decimal('price', 15, 8)->default(0);
            $table->decimal('profit', 15, 8)->default(0);
        });
    }
};

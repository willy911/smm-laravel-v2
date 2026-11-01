<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE service_category_groups
            MODIFY COLUMN type ENUM('emoji', 'icon', 'image') NOT NULL
        ");

        Schema::table('service_category_groups', function (Blueprint $table) {
            $table->string('image')->nullable()->after('type');
        });
    }

    public function down(): void
    {
        Schema::table('service_category_groups', function (Blueprint $table) {
            $table->dropColumn('image');
        });

        DB::statement("
            ALTER TABLE service_category_groups
            MODIFY COLUMN type ENUM('emoji', 'icon') NOT NULL
        ");
    }
};

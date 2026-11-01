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
        Schema::table('users', function (Blueprint $table) {
            $table->index('full_name');
            $table->index('username');
            $table->index('email');
            $table->index('whatsapp');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['full_name']);
            $table->dropIndex(['username']);
            $table->dropIndex(['email']);
            $table->dropIndex(['whatsapp']);
            $table->dropIndex(['deleted_at']);
        });
    }
};

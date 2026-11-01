<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('commission', 15, 8)->default(0)->after('balance');
            $table->string('referral_code', 50)
                ->unique()
                ->after('status');

            $table->unsignedBigInteger('referred_by')
                ->nullable()
                ->after('referral_code');

            $table->foreign('referred_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['referred_by']);
            $table->dropColumn([
                'commission',
                'referral_code',
                'referred_by',
            ]);
        });
    }
};

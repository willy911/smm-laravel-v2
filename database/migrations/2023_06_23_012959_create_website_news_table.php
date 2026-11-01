<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott  
| * Whatsapp : https://wa.me/6285349680016  
| * Telegram : https://t.me/jhondelton   
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('website_news', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('sort_number')->nullable();
            $table->string('title');
            $table->string('slug');
            $table->longText('content');
            $table->string('banner')->nullable();
            $table->boolean('is_popup')->default(false);
            $table->boolean('is_public')->default(false);
            $table->string('only_visible_on')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->timestamp('deleted_at')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('website_news');
    }
};

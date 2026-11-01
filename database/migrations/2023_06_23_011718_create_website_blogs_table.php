<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott  
| * Whatsapp : https://wa.me/6285349680016  
| * Telegram : https://t.me/jhonroott   
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
        Schema::create('website_blogs', function (Blueprint $table) {
            $table->id();
            $table->double('sort_number')->nullable();
            $table->string('category');
            $table->text('tags');
            $table->string('title');
            $table->string('slug');
            $table->longText('content');
            $table->string('banner')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->timestamp('deleted_at')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('website_blogs');
    }
};

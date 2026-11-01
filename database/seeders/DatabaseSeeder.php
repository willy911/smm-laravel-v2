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

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ServiceCategoryGroupSeeder::class,
            AdminSeeder::class,
            UserSeeder::class,
            LocaleSeeder::class,
            UserGroupSeeder::class,
            ConfigSeeder::class,
            WebsiteSitemapSeeder::class,
        ]);
    }
}

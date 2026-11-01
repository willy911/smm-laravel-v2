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
use App\Models\Config;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ConfigSeeder extends Seeder
{
    public function run()
    {
        foreach (config('app.jhonroot') as $key => $item) {
            if (!Config::where('key', $key)->first()) Config::create([
                'key' => $key,
                'value' => config('app.jhonroot')[$key]
            ]);
        }
    }
}

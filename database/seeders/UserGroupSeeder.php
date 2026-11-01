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

use App\Models\User\UserGroup;
use Illuminate\Database\Seeder;

class UserGroupSeeder extends Seeder
{
    public function run(): void
    {
        if (!UserGroup::where('name', 'Member')->first()) UserGroup::create([
            'name'            => 'Member',
            'minimum_deposit' => 0.6452,
            'is_primary'      => '1',
            'is_api_access_enabled' => '1'
        ]);
    }
}

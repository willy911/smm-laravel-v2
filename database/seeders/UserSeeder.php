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

use App\Models\User\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('username', 'jhondelton')->first()) User::create([
            'user_group_id' => 1,
            'locale_id'     => 1,
            'full_name'     => 'Jhon Delton',
            'whatsapp'      => '085349680016',
            'email'         => 'jhondelton@jhonroot.dev',
            'username'      => 'jhondelton',
            'password'      => Hash::make('jhondelton'),
            'balance'       => 100,
            'api'           => [
                'api_key'      => generate_api_key(),
                'secret_key'   => '',
                'whitelist_ip' => '',
            ],
            'notification' => [
                'order'   => ['email' => 0, 'whatsapp' => 0, 'telegram' => 0],
                'deposit' => ['email' => 0, 'whatsapp' => 0, 'telegram' => 0],
                'ticket'  => ['email' => 0, 'whatsapp' => 0, 'telegram' => 0],
            ],
            'email_verified_at' => now(),
        ]);
    }
}

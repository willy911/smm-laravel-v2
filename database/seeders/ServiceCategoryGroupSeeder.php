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

use App\Models\Service\ServiceCategoryGroup;
use Illuminate\Database\Seeder;

class ServiceCategoryGroupSeeder extends Seeder
{
    public function run(): void
    {
        $data = collect([
            ['1', 'Instagram', 'instagram', 'icon', 'InstagramIcon'],
            ['2', 'Facebook', 'facebook', 'icon', 'Facebook02Icon'],
            ['3', 'YouTube', 'youtube', 'icon', 'YoutubeIcon'],
            ['4', 'X (Twitter)', 'twitter', 'icon', 'NewTwitterIcon'],
            ['5', 'Telegram', 'telegram', 'icon', 'TelegramIcon'],
            ['6', 'Spotify', 'spotify', 'icon', 'SpotifyIcon'],
            ['7', 'Tiktok', 'tiktok', 'icon', 'TiktokIcon'],
            ['8', 'Linkedin', 'linkedin', 'icon', 'Linkedin02Icon'],
            ['9', 'Google', 'google', 'icon', 'GoogleIcon'],
            ['10', 'Discord', 'discord', 'icon', 'DiscordIcon'],
            ['11', 'Snapchat', 'snapchat', 'icon', 'SnapchatIcon'],
            ['12', 'Threads', 'threads', 'icon', 'ThreadsIcon'],
            ['13', 'E-Commerce', 'e-commerce', 'icon', 'ShoppingBag02Icon'],
            ['14', 'Whatsapp', 'whatsapp', 'icon', 'WhatsappIcon'],
            ['15', 'Shopee', 'shopee', 'icon', 'ShoppingBag01Icon'],
            ['16', 'Twitch', 'twitch', 'icon', 'TwitchIcon'],
            ['17', 'Website Traffic', 'website-traffic', 'icon', 'GlobalIcon'],
            ['18', 'Other', 'other', 'emoji', '🔥'],
        ]);
        $data->each(function ($item) {
            [$sort_number, $name, $slug, $type, $value] = $item;
            $attributes = compact('sort_number', 'name', 'slug', 'type') +
                ($type === 'icon' ? ['icon' => $value] : ['emoji' => $value]);
            if (!ServiceCategoryGroup::where('name', $name)->exists()) {
                ServiceCategoryGroup::create([
                    'sort_number' => $sort_number,
                    ...$attributes,
                ]);
            }
        });
    }
}

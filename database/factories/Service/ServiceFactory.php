<?php

namespace Database\Factories\Service;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service\Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = [
            'primary',
            'package',
            'custom_comments',
            'custom_comments_package',
            'comment_likes',
            'comment_replies',
            'mentions_hashtag',
            'mentions_with_hashtags',
            'mentions_custom_list',
            'mentions_user_followers',
            'mentions_media_likers',
            'poll',
        ];

        $type = collect($types)->random();

        $min = rand(10, 5000);
        $max = $min + rand(10, 10000);

        $originalPrice = fake()->randomFloat(4, 0.10, 10.00);
        $markup = fake()->randomFloat(4, 0.10, 0.5);
        $price = $originalPrice + $markup;
        $profit = $price - $originalPrice;

        return [
            'service_category_id'         => \App\Models\Service\ServiceCategory::inRandomOrder()->first()?->id ?? 1,
            'service_provider_id'         => 1,
            'service_provider_service_id' => 1,
            'type'                        => $type,
            'name'                        => Str::title(fake()->words(3, true)),
            'original_price'              => number_format($originalPrice, 4, '.', ''),
            'price'                       => number_format($price, 4, '.', ''),
            'profit'                      => number_format($profit, 4, '.', ''),
            'min'                         => number_format($min, 4, '.', ''),
            'max'                         => number_format($max, 4, '.', ''),
            'description'                 => fake()->sentence(10),
            'is_refill_support'           => rand(0, 1),
            'is_cancel_support'           => rand(0, 1),
        ];
    }
}

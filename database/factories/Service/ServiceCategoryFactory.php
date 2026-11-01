<?php

namespace Database\Factories\Service;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service\ServiceCategory>
 */
class ServiceCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'service_category_group_id' => rand(1, 18),
            'name'                      => ucwords(fake()->word()),
            'slug'                      => fake()->slug(),
        ];
    }
}

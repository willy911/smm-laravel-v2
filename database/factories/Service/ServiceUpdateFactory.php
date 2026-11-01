<?php

namespace Database\Factories\Service;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service\ServiceUpdate>
 */
class ServiceUpdateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(['added', 'deleted', 'enabled', 'disabled', 'price_increased', 'price_decreased', 'updated']);
        $contentKey = fake()->randomElement([
            'services:updates.description.min-updated',
            'services:updates.description.max-updated',
            'services:updates.description.price-increased',
            'services:updates.description.price-decreased',
            'services:updates.description.enabled',
            'services:updates.description.disabled',
            'services:updates.description.added',
            'services:updates.description.deleted',
        ]);
        $contentParams = [];
        if (in_array($contentKey, [
            'services:updates.description.min-updated',
            'services:updates.description.max-updated',
            'services:updates.description.price-increased',
            'services:updates.description.price-decreased'
        ])) {
            $contentParams = ['from' => fake()->randomFloat(4, 0.10, 400.00), 'to' => fake()->randomFloat(4, 0.10, 200.00), 'type' => fake()->randomElement(['currency', 'amount'])];
        }
        return [
            'service_id'  => rand(1, 1000),
            'type'        => $type,
            'content_key'     => $contentKey,
            'content_params'  => (object) $contentParams,
        ];
    }
}

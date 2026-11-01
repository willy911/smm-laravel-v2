<?php

namespace Database\Factories\User;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User\UserSigninLog>
 */
class UserSigninLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $createdAt = now()->subDays(rand(0, 10))->subHours(rand(0, 12))->subMinutes(rand(0, 59));
        $data = [
            'user_id'    => rand(1, 10),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'created_at' => $createdAt,
        ];
        return $data;
    }
}

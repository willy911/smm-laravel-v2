<?php

namespace Database\Factories\Order;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order\OrderRefill>
 */
class OrderRefillFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $userId = rand(1, 10);
        $createdAt = now()->subDays(rand(0, 10))->subHours(rand(0, 12))->subMinutes(rand(0, 59));
        $updatedAt = (clone $createdAt)->addSeconds(rand(30, 3600));

        $status = fake()->randomElement(['completed', 'pending', 'processing', 'in_progress', 'error', 'rejected']);

        $data = [
            'user_id'             => $userId,
            'order_id'             => rand(1, 10000),
            'service_id'             => rand(1, 1000),
            'service_provider_order_refill_id'        => 1,
            'ip_address'          => fake()->ipv4(),
            'user_agent'          => fake()->userAgent(),
            'status'              => $status,
            'service_provider_order_refill_log' => (object) collect(['status' => 'success']),
            'service_provider_status_refill_log' => (object) collect(['status' => 'success']),
            'created_at'         => $createdAt,
            'updated_at'         => $updatedAt,
        ];

        return $data;
    }
}

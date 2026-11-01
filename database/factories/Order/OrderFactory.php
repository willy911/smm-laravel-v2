<?php

namespace Database\Factories\Order;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $service = \App\Models\Service\Service::inRandomOrder()->first();
        $createdAt = now()->subDays(rand(0, 10))->subHours(rand(0, 12))->subMinutes(rand(0, 59));
        $updatedAt = (clone $createdAt)->addSeconds(rand(30, 3600));

        $status = fake()->randomElement(['completed', 'pending', 'processing', 'in_progress', 'error', 'partial', 'canceled']);
        $quantity = fake()->numberBetween(10, 1000);

        $price = fake()->randomFloat(8, 0.5, 10);
        $profit = fake()->randomFloat(8, 0.01, 3);
        $finalBalance = fake()->randomFloat(8, 10, 100);
        $initialBalance = round($finalBalance + $price, 8);

        $data = [
            'user_id'             => rand(1, 10),
            'service_provider_id' => rand(1, 3),
            'service_provider_order_id' => rand(111111, 999999),
            'service_id'          => $service->id,
            'service_name'        => $service->name,
            'target'              => fake()->url(),
            'quantity'            => $quantity,
            'ip_address'          => fake()->ipv4(),
            'user_agent'          => fake()->userAgent(),
            'price'               => $price,
            'profit'              => $profit,
            'status'              => $status,
            'additional_input'    => (object) [
                'label' => 'custom_comments',
                'value' => [
                    'comments' => escape_input(implode("\n", array_filter(explode("\n", 'No Comment'), 'trim')))
                ]
            ],
            'service_provider_order_log' => (object) collect(['status' => 'success']),
            'service_provider_status_log' => (object) collect(['status' => 'success']),
            'ordered_via'        => fake()->randomElement(['web', 'api']),
            'initial_balance'    => $initialBalance,
            'final_balance'      => $finalBalance,
            'created_at'         => $createdAt,
            'updated_at'         => $updatedAt,
        ];

        if (in_array($status, ['in_progress', 'processing'])) {
            $remains = fake()->numberBetween(0, $quantity);
            $data['remains'] = $remains;
        }

        return $data;
    }
}

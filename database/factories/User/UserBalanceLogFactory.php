<?php

namespace Database\Factories\User;

use Illuminate\Database\Eloquent\Factories\Factory;

class UserBalanceLogFactory extends Factory
{
    public function definition(): array
    {
        $createdAt = now()->subDays(rand(0, 20))->subHours(rand(0, 12))->subMinutes(rand(0, 59));
        $category = fake()->randomElement(['order', 'deposit', 'other']);
        $contentKey = fake()->randomElement([
            'orders.create_log',
            'orders.create_api_log',
            'orders.create_single_log',
            'orders.create_mass_log',
            'orders.refund_log',
        ]);
        $type = fake()->randomElement(['credit', 'debit']);
        if ($contentKey === 'orders.refund_log') {
            $type = 'credit';
        }
        $amount = fake()->randomFloat(2, 0.10, 100.00);
        $initialBalance = fake()->randomFloat(2, 10.00, 500.00);
        $finalBalance = $type === 'credit'
            ? $initialBalance + $amount
            : $initialBalance - $amount;
        $orderId = rand(1, 999999);
        return [
            'user_id'         => rand(1, 10),
            'type'            => $type,
            'category'        => $category,
            'amount'          => $amount,
            'content_key'     => $contentKey,
            'content_params'  => (object) ['order_id' => $orderId],
            'initial_balance' => round($initialBalance, 2),
            'final_balance'   => round($finalBalance, 2),
            'created_at'      => $createdAt,
        ];
    }
}

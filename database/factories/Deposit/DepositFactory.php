<?php

namespace Database\Factories\Deposit;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Deposit\Deposit>
 */
class DepositFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $paymentMethod = \App\Models\PaymentMethod::inRandomOrder()->first();
        $createdAt = now()->subDays(rand(0, 10))->subHours(rand(0, 12))->subMinutes(rand(0, 59));
        $updatedAt = (clone $createdAt)->addSeconds(rand(30, 3600));

        $status = fake()->randomElement(['success', 'pending', 'expired', 'canceled']);
        $amount = fake()->randomFloat(8, 0.5, 200);
        $bonus = round($amount * 0.10, 8);
        $finalBalance = fake()->randomFloat(8, 20, 100);
        $initialBalance = round($finalBalance + $amount + $bonus, 8);

        $data = [
            'user_id'                  => rand(1, 10),
            'payment_method_id'        => $paymentMethod->id,
            'payment_method_name'      => $paymentMethod->name,
            'amount'                   => $amount,
            'bonus'                    => $bonus,
            'total_payment'            => $amount,
            'status'                   => $status,
            'total_balance'            => round($amount + $bonus, 8),
            'ip_address'               => fake()->ipv4(),
            'user_agent'               => fake()->userAgent(),
            'payment_gateway_api_log' => (object) collect(['status' => 'success']),
            'initial_balance'          => $initialBalance,
            'final_balance'            => $finalBalance,
            'created_at'               => $createdAt,
            'updated_at'               => $updatedAt,
        ];

        return $data;
    }
}

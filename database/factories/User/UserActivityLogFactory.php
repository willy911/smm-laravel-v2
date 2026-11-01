<?php

namespace Database\Factories\User;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User\UserActivityLog>
 */
class UserActivityLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $createdAt = now()->subDays(rand(0, 10))->subHours(rand(0, 12))->subMinutes(rand(0, 59));
        $contentKey = fake()->randomElement([
            'user.email_verification_log',
            'user.update_api_log',
            'user.update_profile_log',
            'auth.signin_to_dashboard_log',
            'auth.signout_from_dashboard_log',
            'auth.signup_success_log',
            'auth.update_password_log',
            'orders.create_log',
            'orders.create_api_log',
            'orders.create_single_log',
            'orders.create_mass_log',
            'orders.cancel_log',
            'orders.refill_log',
            'deposits.create_log',
            'deposits.cancel_log',
            'tickets.create_log',
            'tickets.reply_log',
        ]);
        $id = rand(1, 999999);
        $data = [
            'user_id'    => rand(1, 10),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'content_key'    => $contentKey,
            'content_params' => (object) [],
            'created_at' => $createdAt,
        ];

        if (in_array($contentKey, ['orders.create_log', 'orders.create_mass_log', 'orders.create_single_log', 'orders.create_api_log', 'orders.cancel_log', 'orders.refill_log'])) {
            $data['content_params'] = (object) ['order_id' => $id];
        }

        if (in_array($contentKey, ['deposits.create_log', 'deposits.cancel_log'])) {
            $data['content_params'] = (object) ['deposit_id' => $id];
        }

        if (in_array($contentKey, ['tickets.create_log', 'tickets.reply_log'])) {
            $data['content_params'] = (object) ['ticket_id' => $id];
        }

        return $data;
    }
}

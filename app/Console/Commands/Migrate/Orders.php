<?php

namespace App\Console\Commands\Migrate;

use App\Models\Locale;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class Orders extends Command
{
    protected $signature = 'migrate:orders';

    protected $description = 'Migrate orders from old database';

    public function handle()
    {
        $locale = Locale::find(1);

        DB::connection('mysql_second')
            ->table('orders')
            ->orderBy('id')
            ->chunkById(500, function ($orders) use ($locale) {

                $insert = [];

                foreach ($orders as $order) {
                    $insert[] = [
                        'id' => $order->id,
                        'user_id'           => $order->user_id,
                        'service_provider_id' => $order->service_provider_id,
                        'service_id' => $order->service_id,
                        'service_name' => $order->service_name,
                        'target' => $order->target,
                        'quantity' => $order->quantity,
                        'price' => $order->price / $locale->usd_rate,
                        'profit' => $order->profit / $locale->usd_rate,
                        'start_count' => $order->start_count,
                        'remains' => $order->remains,
                        'status' => $order->status,
                        'service_provider_status' => $order->service_provider_status,
                        'service_provider_order_id' => $order->service_provider_order_id,
                        'service_provider_order_log' => $order->service_provider_order_log,
                        'service_provider_status_log' => $order->service_provider_status_log
                            ? json_encode(json_decode($order->service_provider_status_log, true))
                            : null,
                        'additional_input' => $order->additional_input,
                        'ip_address' => $order->ip_address,
                        'user_agent' => $order->user_agent,
                        'ordered_via' => $order->ordered_via,
                        'is_refunded' => $order->is_refunded,
                        'is_sent' => 1,
                        'created_at' => $order->created_at,
                        'updated_at' => $order->updated_at,
                    ];
                }

                DB::table('orders')->insertOrIgnore($insert);

                $this->info(
                    'Migrated until ID: ' . $orders->last()->id
                );
            });

        $this->info('Migration completed.');

        return self::SUCCESS;
    }
}

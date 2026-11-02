<?php

namespace App\Console\Commands\Order;

use App\Models\Order\Order;
use App\Models\Order\OrderRefill;
use App\Models\User\UserBalanceLog;
use Illuminate\Console\Command;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class StatusOrderRefill extends Command
{
    protected $signature = 'order:status-order-refill';

    protected $description = 'Mengirimkan pesanan refill ke API';

    public function handle()
    {
        $orders = DB::transaction(function () {
            $orders = OrderRefill::has('service.serviceProvider.serviceProviderConfiguration')
                ->withWhereHas('user')
                ->withWhereHas('service.serviceProvider', function ($query) {
                    $query->where('type', 'auto');
                    $query->whereHas('serviceProviderConfiguration');
                })
                ->whereIn('status', ['pending', 'processing', 'in_progress'])
                ->whereNotNull('service_provider_order_refill_id')
                ->where('updated_at', '<=', now()->subMinutes(1))
                ->orderBy('id', 'asc')
                ->limit(5)
                ->lockForUpdate()
                ->get();
            return $orders;
        });

        if ($orders->isEmpty()) {
            $this->info('CHECKING REFILL');
            $this->info('Tidak ada refill yang perlu diperiksa.');

            return;
        }

        $changedCount = 0;
        $checkedCount = 0;

        $this->info('CHECKING REFILL');
        $this->info("Memeriksa {$orders->count()} refill ke provider...");

        $responses = Http::pool(
            fn(Pool $pool) =>
            collect($orders)->map(function ($order) use ($pool) {
                $serviceProviderConfig = optional($order->service->serviceProvider->serviceProviderConfiguration->order_refill_status_configuration);

                $formData = collect($serviceProviderConfig->params)->mapWithKeys(function ($param) use ($order) {

                    if ($param->type === 'custom') {
                        return [$param->key => $param->value];
                    }

                    if ($param->type === 'default_parameter') {
                        return [
                            $param->key => collect($order->service->serviceProvider->default_parameters)
                                ->pluck('value', 'key')
                                ->get($param->key)
                        ];
                    }

                    if (!in_array($param->type, ['custom', 'default_parameter'])) {
                        return [$param->key => strtr($param->type, [
                            'order_refill_id' => $order->service_provider_order_refill_id,
                        ])];
                    }

                    return [];
                })->toArray();

                return $pool
                    ->as($order->id)
                    ->withOptions(['timeout' => 300, 'verify' => false])
                    ->send(
                        $serviceProviderConfig->method,
                        $serviceProviderConfig->endpoint,
                        ['form_params' => $formData]
                    );
            })->all()
        );

        foreach ($responses as $orderId => $response) {
            $order = $orders->firstWhere('id', $orderId);
            $updateData = [
                'updated_at'     => now(),
            ];
            $checkedCount++;
            if ($response->ok()) {
                $orderStatus = data_get($response->object(), $order->service->serviceProvider->serviceProviderConfiguration->order_refill_status_configuration->parse_response->status, $order->status);
                $this->line("ID : {$order->service_provider_order_refill_id} | Status: " . ($orderStatus !== null && $orderStatus !== '' ? $orderStatus : $order->status));
                if ($orderStatus) {
                    $statusesObject = $order
                        ->service
                        ->serviceProvider
                        ->serviceProviderConfiguration
                        ->order_refill_status_configuration
                        ->parse_text
                        ->status;

                    $statuses = (array) $statusesObject;
                    $normalized = array_map('strtolower', $statuses);
                    $key = array_search(strtolower($orderStatus), $normalized, true);
                    $updateData['status'] = $key !== false
                        ? $key
                        : $order->status;
                }
                $updateData['service_provider_status_refill_log'] = $response->json();
                if ($updateData['status'] != $order->status) {
                    $this->line("Refill #{$order->id}: status {$order->status} -> {$updateData['status']}.");
                    $changedCount++;
                }
            } else {
                $this->line("ID : {$order->service_provider_order_refill_id} | Status: HTTP {$response->status()}");
                $this->warn("Refill #{$order->id} gagal diperiksa (HTTP {$response->status()}).");
            }
            $order->update($updateData);
        }

        $this->info("Selesai: {$checkedCount} diperiksa, {$changedCount} berubah status.");
    }
}

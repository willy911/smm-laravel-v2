<?php

namespace App\Console\Commands\Order;

use App\Models\Order\Order;
use App\Models\User\UserBalanceLog;
use Illuminate\Console\Command;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class StatusOrder extends Command
{
    protected $signature = 'order:status-order';

    protected $description = 'Mengirimkan pesanan ke API';

    public function handle()
    {
        $orders = DB::transaction(function () {
            $orders = Order::has('serviceProvider.serviceProviderConfiguration')
                ->withWhereHas('user')
                ->withWhereHas('serviceProvider', function ($query) {
                    $query->where('type', 'auto');
                    $query->whereHas('serviceProviderConfiguration');
                })
                ->whereIn('status', ['pending', 'processing', 'in_progress'])
                ->where('is_sent', true)
                ->whereNotNull('service_provider_order_id')
                ->where('updated_at', '<=', now()->subMinutes(5))
                ->orderBy('id', 'asc')
                ->limit(50)
                ->lockForUpdate()
                ->get();
            return $orders;
        });

        if ($orders->isEmpty()) {
            return;
        }

        $responses = Http::pool(
            fn(Pool $pool) =>
            collect($orders)->map(function ($order) use ($pool) {
                $serviceProviderConfig = optional($order->serviceProvider->serviceProviderConfiguration->order_status_configuration);

                $formData = collect($serviceProviderConfig->params)->mapWithKeys(function ($param) use ($order) {

                    if ($param->type === 'custom') {
                        return [$param->key => $param->value];
                    }

                    if ($param->type === 'default_parameter') {
                        return [
                            $param->key => collect($order->serviceProvider->default_parameters)
                                ->pluck('value', 'key')
                                ->get($param->key)
                        ];
                    }

                    if (!in_array($param->type, ['custom', 'default_parameter'])) {
                        return [$param->key => strtr($param->type, [
                            'order_id' => $order->service_provider_order_id,
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
            // info($order->id);
            // info($response->status());
            // info($response->json());
            if (! $response instanceof \Illuminate\Http\Client\Response) {
                $order->update($updateData);
                continue;
            }
            if ($response->ok()) {
                if ($orderStatus = data_get($response->object(), $order->serviceProvider->serviceProviderConfiguration->order_status_configuration->parse_response->status, $order->status)) {
                    $statusesObject = $order
                        ->serviceProvider
                        ->serviceProviderConfiguration
                        ->order_status_configuration
                        ->parse_text
                        ->status;

                    $statuses = (array) $statusesObject;
                    $normalized = array_map('strtolower', $statuses);
                    $key = array_search(strtolower($orderStatus), $normalized, true);
                    $updateData['status'] = $key !== false
                        ? $key
                        : $order->status;
                }
                $updateData['start_count'] = data_get($response->object(), $order->serviceProvider->serviceProviderConfiguration->order_status_configuration->parse_response->start_count, $order->start_count) ?: $order->start_count;
                $rawRemains = data_get($response->object(), $order->serviceProvider->serviceProviderConfiguration->order_status_configuration->parse_response->remains);
                $updateData['remains'] = ($rawRemains !== null && $rawRemains !== '') ? $rawRemains : $order->remains;
                $updateData['service_provider_status_log'] = $response->json();
                if ($updateData['status'] == 'completed') $updateData['remains'] = 0;
                if (in_array($updateData['status'], ['canceled', 'partial', 'error']) && $order->user_id) {
                    $refundAmount = ($order->price / $order->quantity) * $updateData['remains'];
                    $reduceProfit = ($order->profit / $order->quantity) * $updateData['remains'];
                    if ($updateData['remains'] == 0 || $updateData['remains'] > $order->quantity) {
                        $refundAmount = $order->price;
                        $reduceProfit = $order->profit;
                    }
                    $initialBalance = $order->user->balance;
                    $order->user->increment('balance', $refundAmount);
                    $finalBalance = $initialBalance + $refundAmount;
                    $updateData['is_refunded'] = '1';
                    $updateData['profit'] = $order->profit - $reduceProfit;
                    $updateData['price'] = $order->price - $refundAmount;
                    $insertBalanceLog = UserBalanceLog::create([
                        'user_id'         => $order->user_id,
                        'type'            => 'credit',
                        'category'        => 'order',
                        'amount'          => $refundAmount,
                        'initial_balance' => $initialBalance,
                        'final_balance'   => $finalBalance,
                        'content_key'  => 'orders:log.refund-successful',
                        'content_params'  => (object) ['order_id' => $order->id],
                    ]);
                }
            }
            $order->update($updateData);
        }
    }
}

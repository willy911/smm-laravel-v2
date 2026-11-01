<?php

namespace App\Console\Commands\Order;

use App\Models\Order\Order;
use App\Models\User\UserBalanceLog;
use Illuminate\Console\Command;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class SendOrder extends Command
{
    protected $signature = 'order:send-order';

    protected $description = 'Mengirimkan pesanan ke API';

    public function handle()
    {
        $orders = DB::transaction(function () {
            $orders = Order::has('serviceProvider.serviceProviderConfiguration')
                ->has('user')
                ->has('service')
                ->with('user')
                ->withWhereHas('serviceProvider', function ($query) {
                    $query->where('type', 'auto');
                    $query->whereHas('serviceProviderConfiguration');
                })
                ->where('status', 'pending')
                ->where('is_sent', false)
                ->whereNull('service_provider_order_id')
                ->where('updated_at', '<=', now()->subMinutes(1))
                ->orderBy('id', 'asc')
                ->limit(5)
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
                $serviceProviderConfig = optional($order->serviceProvider->serviceProviderConfiguration->order_create_configuration);

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
                            'service_id'          => $order->service->service_provider_service_id,
                            'order_target'        => $order->target,
                            'order_quantity'      => $order->quantity,
                            'order_comments'      => in_array($order->service->type, ['custom_comments', 'custom_comments_package', 'comment_replies']) ? $order->additional_input['value'] : null,
                            'order_usernames'     => in_array($order->service->type, ['mentions_custom_list', 'mentions_with_hashtags']) ? $order->additional_input['value'] : null,
                            'order_username'      => in_array($order->service->type, ['mentions_user_followers', 'comment_likes', 'comment_replies']) ? $order->additional_input['value'] : null,
                            'order_hashtags'      => $order->service->type == 'mentions_with_hashtags' ? $order->additional_input['value'] : null,
                            'order_hashtag'       => $order->service->type == 'mentions_hashtag' ? $order->additional_input['value'] : null,
                            'order_media_url'     => $order->service->type == 'mentions_media_likers' ? $order->additional_input['value'] : null,
                            'order_answer_number' => $order->service->type == 'poll' ? $order->additional_input['value'] : null,
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
            if ($response->ok()) {
                $serviceProviderOrderID =
                    data_get(
                        $response->object(),
                        $order->serviceProvider->serviceProviderConfiguration->order_create_configuration->parse_response->order_id
                    );
                if ($serviceProviderOrderID) {
                    $updateData['is_sent'] = true;
                    $updateData['service_provider_order_id'] = $serviceProviderOrderID;
                } else {
                    $refundAmount = ($order->price / $order->quantity) * $order->remains;
                    $reduceProfit = ($order->profit / $order->quantity) * $order->remains;
                    if ($order->remains == 0 || $order->remains > $order->quantity) {
                        $refundAmount = $order->price;
                        $reduceProfit = $order->profit;
                    }
                    $initialBalance = $order->user->balance;
                    $order->user->increment('balance', $refundAmount);
                    $finalBalance = $initialBalance + $refundAmount;
                    $updateData['status'] = 'canceled';
                    $updateData['remains'] = 0;
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
                $updateData['service_provider_order_log'] = $response->json();
            }
            $order->update($updateData);
        }
    }
}

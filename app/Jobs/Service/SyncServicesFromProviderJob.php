<?php

namespace App\Jobs\Service;

use App\Models\Service\Service;
use App\Models\Service\ServiceUpdate;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class SyncServicesFromProviderJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $providerId) {}

    public function handle()
    {
        Service::where('service_provider_id', $this->providerId)
            ->where('status', 1)
            ->whereNotExists(function ($q) {
                $q->selectRaw(1)
                    ->from('service_provider_services as sps')
                    ->whereColumn('sps.service_provider_id', 'services.service_provider_id')
                    ->whereColumn('sps.service_provider_service_id', 'services.service_provider_service_id');
            })
            ->chunkById(100, function ($services) {
                foreach ($services as $service) {
                    if ($service->status == '1') {
                        $service->update([
                            'status' => 0,
                        ]);
                        ServiceUpdate::create([
                            'service_id'     => $service->id,
                            'type'           => 'disabled',
                            'content_key'    => 'services:updates.description.disabled',
                            'content_params' => (object) [],
                        ]);
                    }
                }
            });

        Service::where('service_provider_id', $this->providerId)
            ->where('status', 0)
            ->whereExists(function ($q) {
                $q->selectRaw(1)
                    ->from('service_provider_services as sps')
                    ->whereColumn('sps.service_provider_id', 'services.service_provider_id')
                    ->whereColumn('sps.service_provider_service_id', 'services.service_provider_service_id');
            })
            ->chunkById(100, function ($services) {
                foreach ($services as $service) {
                    if ($service->status == '0') {
                        $service->update([
                            'status' => 1,
                        ]);
                        ServiceUpdate::create([
                            'service_id'     => $service->id,
                            'type'           => 'enabled',
                            'content_key'    => 'services:updates.description.enabled',
                            'content_params' => (object) [],
                        ]);
                    }
                }
            });

        Service::where('service_provider_id', $this->providerId)
            ->where('status', 1)
            ->whereExists(function ($q) {
                $q->selectRaw(1)
                    ->from('service_provider_services as sps')
                    ->whereColumn('sps.service_provider_service_id', 'services.service_provider_service_id')
                    ->where('sps.service_provider_id', $this->providerId);
            })
            ->with(['serviceProviderService' => function ($q) {
                $q->where('service_provider_id', $this->providerId);
            }])
            ->chunkById(100, function ($services) {
                foreach ($services as $service) {
                    $sps = $service->serviceProviderService;
                    if (!$sps) {
                        continue;
                    }
                    $updates = [];
                    $logs = [];
                    $newMin = $sps->min;
                    $newMax = $sps->max;
                    if ($service->min != $newMin) {
                        $logs[] = [
                            'type' => 'updated',
                            'content_key'    => 'services:updates.description.min-updated',
                            'content_params' => (object) [
                                'from' => $service->min,
                                'to'   => $newMin,
                                'type' => 'amount'
                            ],
                        ];
                        $updates['min'] = $newMin;
                    }

                    if ($service->max != $newMax) {
                        $logs[] = [
                            'type' => 'updated',
                            'content_key'    => 'services:updates.description.max-updated',
                            'content_params' => (object) [
                                'from' => $service->max,
                                'to'   => $newMax,
                                'type' => 'amount'
                            ],
                        ];
                        $updates['max'] = $newMax;
                    }

                    if ($sps->description !== null
                        && trim((string) $sps->description) !== trim((string) $service->description)
                    ) {
                        $updates['description'] = $sps->description;
                        $logs[] = [
                            'type' => 'updated',
                            'content_key'    => 'services:updates.description.description-updated',
                            'content_params' => (object) [],
                        ];
                    }

                    if ($sps->type !== null && $service->type !== $sps->type) {
                        $updates['type'] = $sps->type;
                        $logs[] = [
                            'type' => 'updated',
                            'content_key'    => 'services:updates.description.type-updated',
                            'content_params' => (object) [
                                'from' => $service->type,
                                'to'   => $sps->type,
                            ],
                        ];
                    }

                    if ($sps->is_refill_support !== null
                        && (int) $service->is_refill_support !== (int) $sps->is_refill_support
                    ) {
                        $updates['is_refill_support'] = $sps->is_refill_support;
                        $logs[] = [
                            'type' => 'updated',
                            'content_key'    => 'services:updates.description.refill-support-updated',
                            'content_params' => (object) [
                                'from' => (int) $service->is_refill_support,
                                'to'   => (int) $sps->is_refill_support,
                            ],
                        ];
                    }

                    if ($sps->is_cancel_support !== null
                        && (int) $service->is_cancel_support !== (int) $sps->is_cancel_support
                    ) {
                        $updates['is_cancel_support'] = $sps->is_cancel_support;
                        $logs[] = [
                            'type' => 'updated',
                            'content_key'    => 'services:updates.description.cancel-support-updated',
                            'content_params' => (object) [
                                'from' => (int) $service->is_cancel_support,
                                'to'   => (int) $sps->is_cancel_support,
                            ],
                        ];
                    }

                    if (!$service->is_auto_update_price && !$service->is_manual_profit) {
                        continue;
                    }

                    if ($service->is_auto_update_price || $service->is_manual_profit) {
                        $profit = $service->is_manual_profit
                            ? $service->profit
                            : $sps->profit;
                        $newPrice = bcadd($sps->original_price, $profit, 8);
                        if ($service->price != $newPrice) {
                            $logs[] = [
                                'type' => $service->price < $newPrice
                                    ? 'price_increased'
                                    : 'price_decreased',
                                'content_key'    => $service->price < $newPrice ? 'services:updates.description.price-increased' : 'services:updates.description.price-decreased',
                                'content_params' => (object) [
                                    'from' => $service->price,
                                    'to'   => $newPrice,
                                    'type' => 'currency'
                                ],
                            ];
                            $updates['price'] = $newPrice;
                            $updates['profit'] = $profit;
                            $updates['original_price'] = $sps->original_price;
                        }
                    }
                    if (!empty($updates)) {
                        $service->update($updates);
                        foreach ($logs as $log) {
                            ServiceUpdate::create([
                                'service_id' => $service->id,
                                ...$log,
                            ]);
                        }
                    }
                }
            });
    }
}

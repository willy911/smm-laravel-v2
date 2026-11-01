<?php

namespace App\Jobs\Service;

use App\Models\Service\ServiceProvider;
use App\Jobs\Service\UpsertProviderServiceJob;
use App\Jobs\Service\FinalizeProviderServiceSyncJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;

class FetchProviderServicesJob implements ShouldQueue
{
    use Queueable;
    public $timeout = 120;
    public $tries = 3;
    public function __construct(public int $providerId) {}
    public function handle()
    {
        $serviceProvider = ServiceProvider::with([
            'serviceProviderConfiguration',
            'locale',
        ])->find($this->providerId);
        if (! $serviceProvider) {
            return;
        }
        try {
            $config = optional(
                $serviceProvider->serviceProviderConfiguration->services_configuration
            );
            $formData = collect($config->params)->mapWithKeys(function ($param) use ($serviceProvider) {
                if ($param->type === 'custom') {
                    return [$param->key => $param->value];
                }
                if ($param->type === 'default_parameter') {
                    return [
                        $param->key => collect($serviceProvider->default_parameters)
                            ->pluck('value', 'key')
                            ->get($param->key),
                    ];
                }

                return [];
            })->toArray();

            $response = Http::asForm()
                ->withoutVerifying()
                ->timeout(120)
                ->send(
                    $config->method,
                    $config->endpoint,
                    ['form_params' => $formData]
                );

            if (!$response->successful() || empty($response->body())) {
                return;
            }

            $rawServices = data_get(
                $response->object(),
                $config->parse_response->looping,
                []
            );

            if (! is_array($rawServices)) {
                return;
            }

            $mappedServices = [];

            $rate = $serviceProvider->locale->usd_rate;
            $profitConfig = $config->profit_configs;

            foreach ($rawServices as $service) {
                $serviceId = data_get($service, $config->parse_response->id);

                if (! $serviceId) {
                    continue;
                }

                $basePrice = data_get($service, $config->parse_response->price) / $rate;

                $profit = $profitConfig->type === 'fixed'
                    ? $profitConfig->value
                    : ($profitConfig->value / 100) * $basePrice;

                $mappedServices[] = [
                    'service_provider_id' => $serviceProvider->id,
                    'service_provider_service_id' => $serviceId,
                    'original_price' => $basePrice,
                    'price' => $basePrice + $profit,
                    'profit' => $profit,
                    'min' => (int) data_get($service, $config->parse_response->min),
                    'max' => (int) data_get($service, $config->parse_response->max),
                ];
            }

            if (empty($mappedServices)) {
                return;
            }

            $incomingServiceIds = collect($mappedServices)
                ->pluck('service_provider_service_id')
                ->unique()
                ->values();

            $jobs = collect($mappedServices)
                ->chunk(100)
                ->map(
                    fn($chunk) =>
                    new UpsertProviderServiceJob(
                        $serviceProvider->id,
                        $chunk->toArray()
                    )
                )
                ->toArray();

            Bus::batch($jobs)
                ->then(function ($batch) use ($serviceProvider, $incomingServiceIds) {
                    if ($batch->failedJobs > 0) {
                        return;
                    }

                    FinalizeProviderServiceSyncJob::dispatch(
                        $serviceProvider->id,
                        $incomingServiceIds->toArray()
                    )->onQueue('service-provider-finalize');
                })
                ->catch(function ($batch, \Throwable $e) {})
                ->name('Sync Provider Services: ' . $serviceProvider->id)
                ->onQueue('service-provider-upsert')
                ->dispatch();
        } catch (\Throwable $e) {
            report($e);
        }
    }
}

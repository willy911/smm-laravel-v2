<?php

namespace App\Jobs\Service;

use App\Models\Service\ServiceProvider;
use App\Jobs\Service\UpsertProviderServiceJob;
use App\Jobs\Service\FinalizeProviderServiceSyncJob;
use App\Services\General\Service\ProviderServicesFetcher;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Bus;

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
            $fetchResult = (new ProviderServicesFetcher)->fetch($serviceProvider);

            $mappedServices = $fetchResult['services'];

            if (!$fetchResult['ok'] || empty($mappedServices)) {
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

<?php

namespace App\Jobs\Service;

use App\Models\Service\ServiceProviderService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class FinalizeProviderServiceSyncJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $providerId,
        public array $incomingServiceIds
    ) {}

    public function handle()
    {
        ServiceProviderService::where('service_provider_id', $this->providerId)
            ->whereNotIn('service_provider_service_id', $this->incomingServiceIds)->delete();
        SyncServicesFromProviderJob::dispatch(
            $this->providerId
        )->onQueue('service-sync');
    }
}

<?php

namespace App\Console\Commands\Service;

use App\Jobs\Service\FetchProviderServicesJob;
use App\Models\Service\ServiceProvider;
use Illuminate\Console\Command;

class SyncService extends Command
{
    protected $signature = 'service:sync-service';

    protected $description = 'Mengambil Layanan Penyedia';

    public function handle()
    {
        ServiceProvider::query()
            ->whereHas('serviceProviderConfiguration')
            ->where('type', 'auto')
            ->select('id')
            ->chunkById(10, function ($providers) {
                foreach ($providers as $provider) {
                    FetchProviderServicesJob::dispatch($provider->id)
                        ->onQueue('service-provider-fetch')
                        ->delay(now()->addSeconds($provider->rate_limit ?? 5));
                }
            });
    }
}

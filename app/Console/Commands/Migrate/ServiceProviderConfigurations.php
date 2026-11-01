<?php

namespace App\Console\Commands\Migrate;

use App\Models\Locale;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ServiceProviderConfigurations extends Command
{
    protected $signature = 'migrate:service-provider-configurations';

    protected $description = 'Migrate service provider configurations from old database';

    public function handle()
    {
        $locale = Locale::find(1);

        DB::connection('mysql_second')
            ->table('service_provider_configurations')
            ->orderBy('id')
            ->chunkById(500, function ($serviceProviderConfigurations) use ($locale) {

                $insert = [];

                foreach ($serviceProviderConfigurations as $serviceProviderConfiguration) {
                    $insert[] = [
                        'id' => $serviceProviderConfiguration->id,
                        'service_provider_id' => $serviceProviderConfiguration->service_provider_id,
                        'account_configuration' => $serviceProviderConfiguration->account_configuration
                            ? json_encode(json_decode($serviceProviderConfiguration->account_configuration, true))
                            : null,
                        'services_configuration' => $serviceProviderConfiguration->services_configuration
                            ? json_encode(json_decode($serviceProviderConfiguration->services_configuration, true))
                            : null,
                        'order_create_configuration' => $serviceProviderConfiguration->order_create_configuration
                            ? json_encode(json_decode($serviceProviderConfiguration->order_create_configuration, true))
                            : null,
                        'order_status_configuration' => $serviceProviderConfiguration->order_status_configuration
                            ? json_encode(json_decode($serviceProviderConfiguration->order_status_configuration, true))
                            : null,
                        'order_cancel_create_configuration' => $serviceProviderConfiguration->order_cancel_create_configuration
                            ? json_encode(json_decode($serviceProviderConfiguration->order_cancel_create_configuration, true))
                            : null,
                        'order_refill_create_configuration' => $serviceProviderConfiguration->order_refill_create_configuration
                            ? json_encode(json_decode($serviceProviderConfiguration->order_refill_create_configuration, true))
                            : null,
                        'order_refill_status_configuration' => $serviceProviderConfiguration->order_refill_status_configuration
                            ? json_encode(json_decode($serviceProviderConfiguration->order_refill_status_configuration, true))
                            : null,
                        'created_at' => $serviceProviderConfiguration->created_at,
                        'updated_at' => $serviceProviderConfiguration->updated_at,
                    ];
                }

                DB::table('service_provider_configurations')->insertOrIgnore($insert);

                $this->info(
                    'Migrated until ID: ' . $serviceProviderConfigurations->last()->id
                );
            });

        $this->info('Migration completed.');

        return self::SUCCESS;
    }
}

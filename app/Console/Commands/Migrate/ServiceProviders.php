<?php

namespace App\Console\Commands\Migrate;

use App\Models\Locale;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ServiceProviders extends Command
{
    protected $signature = 'migrate:service-providers';

    protected $description = 'Migrate service providers from old database';

    public function handle()
    {
        $locale = Locale::find(1);

        DB::connection('mysql_second')
            ->table('service_providers')
            ->orderBy('id')
            ->chunkById(500, function ($serviceProviders) use ($locale) {

                $insert = [];

                foreach ($serviceProviders as $serviceProvider) {
                    $insert[] = [
                        'id' => $serviceProvider->id,
                        'locale_id' => $serviceProvider->currency === 'IDR' ? 1 : 2,
                        'name' => $serviceProvider->name,
                        'alias' => $serviceProvider->alias,
                        'type' => 'auto',
                        'default_parameters' => $serviceProvider->default_parameters
                            ? json_encode(json_decode($serviceProvider->default_parameters, true))
                            : null,
                        'last_balance' => $serviceProvider->last_balance / $locale->usd_rate,
                        'is_refill_support' => $serviceProvider->is_refill_support,
                        'is_cancel_support' => $serviceProvider->is_cancel_support,
                        'status' => $serviceProvider->status,
                        'created_at' => $serviceProvider->created_at,
                        'updated_at' => $serviceProvider->updated_at,
                        'deleted_at' => $serviceProvider->deleted_at,
                    ];
                }

                DB::table('service_providers')->insertOrIgnore($insert);

                $this->info(
                    'Migrated until ID: ' . $serviceProviders->last()->id
                );
            });

        $this->info('Migration completed.');

        return self::SUCCESS;
    }
}

<?php

namespace App\Console\Commands\Migrate;

use App\Models\Locale;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class Services extends Command
{
    protected $signature = 'migrate:services';

    protected $description = 'Migrate services from old database';

    public function handle()
    {
        $locale = Locale::find(1);

        DB::connection('mysql_second')
            ->table('services')
            ->orderBy('id')
            ->chunkById(500, function ($services) use ($locale) {

                $insert = [];

                foreach ($services as $service) {
                    $insert[] = [
                        'id' => $service->id,
                        'sort_number' => $service->sort_number,
                        'type'         => $service->type,
                        'service_category_id'         => $service->service_category_id,
                        'service_provider_id'         => $service->service_provider_id,
                        'service_provider_service_id' => $service->service_provider_service_id,
                        'name'                        => $service->name,
                        'min'                         => $service->min,
                        'max'                         => $service->max,
                        'original_price' => $service->original_price / $locale->usd_rate,
                        'price' => $service->price / $locale->usd_rate,
                        'profit' => $service->profit / $locale->usd_rate,
                        'description'                 => $service->description,
                        'is_refill_support'           => $service->is_refill_support,
                        'is_cancel_support'           => $service->is_cancel_support,
                        'is_auto_update_price'        => $service->is_auto_update_price,
                        'is_manual_profit'            => $service->is_manual_profit,
                        'refill_days'                 => $service->refill_days,
                        'refill_available_in_hours'   => $service->refill_available_in_hours,
                        'created_at' => $service->created_at,
                        'updated_at' => $service->updated_at,
                        'deleted_at' => $service->deleted_at,
                    ];
                }

                DB::table('services')->insertOrIgnore($insert);

                $this->info(
                    'Migrated until ID: ' . $services->last()->id
                );
            });

        $this->info('Migration completed.');

        return self::SUCCESS;
    }
}

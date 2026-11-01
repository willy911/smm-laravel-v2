<?php

namespace App\Console\Commands\Migrate;

use App\Models\Locale;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ServiceCategories extends Command
{
    protected $signature = 'migrate:service-categories';

    protected $description = 'Migrate service categories from old database';

    public function handle()
    {
        $locale = Locale::find(1);

        DB::connection('mysql_second')
            ->table('service_categories')
            ->orderBy('id')
            ->chunkById(500, function ($serviceCategories) use ($locale) {

                $insert = [];

                foreach ($serviceCategories as $serviceCategory) {
                    $insert[] = [
                        'id' => $serviceCategory->id,
                        'sort_number' => $serviceCategory->sort_number,
                        'service_category_group_id' => $serviceCategory->service_category_group_id,
                        'name' => $serviceCategory->name,
                        'slug' => $serviceCategory->slug,
                        'profit_configs' => json_encode([
                            'type' => 'percentage',
                            'value' => 10,
                            'display_value' => 10,
                        ]),
                        'status' => $serviceCategory->status,
                        'created_at' => $serviceCategory->created_at,
                        'updated_at' => $serviceCategory->updated_at,
                        'deleted_at' => $serviceCategory->deleted_at,
                    ];
                }

                DB::table('service_categories')->insertOrIgnore($insert);

                $this->info(
                    'Migrated until ID: ' . $serviceCategories->last()->id
                );
            });

        $this->info('Migration completed.');

        return self::SUCCESS;
    }
}

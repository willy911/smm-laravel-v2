<?php

namespace App\Console\Commands\Migrate;

use App\Models\Locale;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ServiceCategoryGroups extends Command
{
    protected $signature = 'migrate:service-category-groups';

    protected $description = 'Migrate service category groups from old database';

    public function handle()
    {
        $locale = Locale::find(1);

        DB::connection('mysql_second')
            ->table('service_category_groups')
            ->orderBy('id')
            ->chunkById(500, function ($serviceCategoryGroups) use ($locale) {

                $insert = [];

                foreach ($serviceCategoryGroups as $serviceCategoryGroup) {
                    $insert[] = [
                        'id' => $serviceCategoryGroup->id,
                        'sort_number' => $serviceCategoryGroup->sort_number,
                        'name' => $serviceCategoryGroup->name,
                        'slug' => $serviceCategoryGroup->slug,
                        'type' => $serviceCategoryGroup->type,
                        'icon' => $serviceCategoryGroup->icon,
                        'emoji' => $serviceCategoryGroup->emoji,
                        'created_at' => $serviceCategoryGroup->created_at,
                        'updated_at' => $serviceCategoryGroup->updated_at,
                        'deleted_at' => $serviceCategoryGroup->deleted_at,
                    ];
                }

                DB::table('service_category_groups')->insertOrIgnore($insert);

                $this->info(
                    'Migrated until ID: ' . $serviceCategoryGroups->last()->id
                );
            });

        $this->info('Migration completed.');

        return self::SUCCESS;
    }
}

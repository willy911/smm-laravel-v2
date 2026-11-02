<?php

namespace App\Jobs\Service;

use App\Models\Service\ServiceProviderService;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class UpsertProviderServiceJob implements ShouldQueue
{
    use Batchable, Queueable;

    public $timeout = 60;

    public function __construct(
        public int $providerId,
        public array $services
    ) {}

    public function handle()
    {
        $now = now();
        $payload = [];

        foreach ($this->services as $service) {
            $originalPrice = (float) $service['price'];

            $sellingPrice = round($originalPrice * 1.1, 8);
            $profit = round($sellingPrice - $originalPrice, 8);

            if ($sellingPrice > 999999) {

                continue;
            }

            $payload[] = [
                'service_provider_id' => $this->providerId,
                'service_provider_service_id' => $service['service_provider_service_id'],
                'original_price' => $originalPrice,
                'price' => $sellingPrice,
                'profit' => $profit,
                'min' => (int) $service['min'],
                'max' => (int) $service['max'],
                'description' => $service['description'] ?? null,
                'updated_at' => $now,
                'created_at' => $now,
            ];
        }

        if (empty($payload)) {
            return;
        }

        // Deskripsi jangan ditimpa bila fetch baru tidak menyediakan (NULL/kosong):
        // pertahankan deskripsi lama agar data yang sudah terkumpul tidak hilang.
        ServiceProviderService::query()->upsert(
            $payload,
            ['service_provider_id', 'service_provider_service_id'],
            [
                'original_price',
                'price',
                'profit',
                'min',
                'max',
                'description' => DB::raw('IF(VALUES(description) IS NULL OR VALUES(description) = \'\', description, VALUES(description))'),
                'updated_at',
            ]
        );
    }
}

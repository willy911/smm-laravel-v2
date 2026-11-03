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

    /**
     * Upsert layanan provider ke tabel service_provider_services.
     *
     * Kontrak payload (dari ProviderServicesFetcher — SATU-SATUNYA tempat
     * profit dihitung, dari profit_configs provider):
     *   - original_price : harga mentah provider (setelah konversi kurs locale).
     *   - price          : harga jual = original_price + profit.
     *   - profit         : keuntungan sesuai profit_configs (persen/fixed).
     *
     * Job ini TIDAK menambahkan markup lagi — sebelumnya ia menanduk ×1.1 di
     * atas price (yang sudah berisi profit), menyebabkan profit dobel.
     */
    public function handle()
    {
        $now = now();
        $payload = [];

        foreach ($this->services as $service) {
            $originalPrice = isset($service['original_price'])
                ? (float) $service['original_price']
                : (float) $service['price'] - (float) ($service['profit'] ?? 0);
            $sellingPrice = (float) $service['price'];
            // Jaminan invarian: price = original_price + profit.
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

        // Upsert dipecah per 500 baris: satu upsert massal dengan ribuan baris
        // menghasilkan placeholder SQL > batas ~65k sehingga MySQL/MariaDB
        // menolak query (SQLSTATE 1118/1390).
        foreach (array_chunk($payload, 500) as $chunk) {
            // Deskripsi jangan ditimpa bila fetch baru tidak menyediakan (NULL/kosong):
            // pertahankan deskripsi lama agar data yang sudah terkumpul tidak hilang.
            ServiceProviderService::query()->upsert(
                $chunk,
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
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Generalisasi sumber deskripsi agar berlaku untuk semua panel:
     * - Provider id 13 (GOP) & 14 (Flazpedia) adalah platform Perfect Panel yang menyediakan
     *   endpoint JSON per layanan: GET {base}/services/get-service-description/{id}.
     *   Ini jauh lebih efisien daripada scrape halaman utuh (533 bytes vs 9MB).
     * - GOP: ganti descriptions_scrape (scrape 9MB) dengan descriptions_endpoint.
     * - Flazpedia: API action=services sudah menyertakan description (parse_response.description)
     *   tetapi hanya 149/457 terisi — aktifkan descriptions_endpoint juga untuk sisanya.
     * Idempoten.
     */
    public function up(): void
    {
        // GOP: API tidak menyediakan description. Sumber utama: scrape JSON inline
        // halaman services (window.SERVICES_DATA, 7163/7182 terisi) — 1 request.
        $this->enableDescriptionsScrape(13, [
            'enabled'           => true,
            'url'               => 'https://godofpanel.com/services',
            'data_key'          => 'SERVICES_DATA',
            'id_field'          => 'id',
            'description_field' => 'description',
        ]);

        // GOP juga platform Perfect Panel: endpoint per-service JSON tersedia
        // (GET /services/get-service-description/{id}) — dipakai sebagai cadangan
        // bila scrape gagal, dibatasi max_requests.
        $this->enableDescriptionsEndpoint(13, [
            'enabled'           => true,
            'url_template'      => 'https://godofpanel.com/services/get-service-description/{id}',
            'description_field' => 'description',
            'timeout'           => 15,
            'concurrency'       => 20,
            'max_requests'      => 300,
        ]);
    }

    public function down(): void
    {
        $this->disableDescriptionsEndpoint(13);
        $this->disableDescriptionsScrape(13);
    }

    /**
     * Tambahkan blok descriptions_endpoint untuk provider (bila belum sama).
     */
    protected function enableDescriptionsEndpoint(int $serviceProviderId, array $endpoint): void
    {
        $row = DB::table('service_provider_configurations')
            ->where('service_provider_id', $serviceProviderId)
            ->first();

        if (!$row) {
            return;
        }

        $config = json_decode($row->services_configuration, true);

        if (!is_array($config)) {
            return;
        }

        if (($config['descriptions_endpoint'] ?? null) === $endpoint) {
            return;
        }

        $config['descriptions_endpoint'] = $endpoint;

        $this->persist($serviceProviderId, $config);
    }

    /**
     * Hapus blok descriptions_endpoint.
     */
    protected function disableDescriptionsEndpoint(int $serviceProviderId): void
    {
        $config = $this->readConfig($serviceProviderId);

        if ($config === null || !isset($config['descriptions_endpoint'])) {
            return;
        }

        unset($config['descriptions_endpoint']);

        $this->persist($serviceProviderId, $config);
    }

    /**
     * Tambahkan blok descriptions_scrape (fallback untuk panel non-Perfect-Panel).
     */
    protected function enableDescriptionsScrape(int $serviceProviderId, array $scrape): void
    {
        $config = $this->readConfig($serviceProviderId);

        if ($config === null) {
            return;
        }

        if (($config['descriptions_scrape'] ?? null) === $scrape) {
            return;
        }

        $config['descriptions_scrape'] = $scrape;

        $this->persist($serviceProviderId, $config);
    }

    /**
     * Hapus blok descriptions_scrape.
     */
    protected function disableDescriptionsScrape(int $serviceProviderId): void
    {
        $config = $this->readConfig($serviceProviderId);

        if ($config === null || !isset($config['descriptions_scrape'])) {
            return;
        }

        unset($config['descriptions_scrape']);

        $this->persist($serviceProviderId, $config);
    }

    protected function readConfig(int $serviceProviderId): ?array
    {
        $row = DB::table('service_provider_configurations')
            ->where('service_provider_id', $serviceProviderId)
            ->first();

        if (!$row) {
            return null;
        }

        $config = json_decode($row->services_configuration, true);

        return is_array($config) ? $config : null;
    }

    protected function persist(int $serviceProviderId, array $config): void
    {
        DB::table('service_provider_configurations')
            ->where('service_provider_id', $serviceProviderId)
            ->update([
                'services_configuration' => json_encode(
                    $config,
                    JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
                ),
            ]);
    }
};

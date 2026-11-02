<?php

namespace App\Services\General\Service;

use App\Models\Service\ServiceProvider;
use Illuminate\Support\Facades\Http;

/**
 * Sumber logika tunggal fetch + mapping layanan provider (dipakai cron
 * FetchProviderServicesJob dan tombol manual sync di admin/services).
 */
class ProviderServicesFetcher
{
    /**
     * Fetch layanan dari API provider dan petahkan ke format internal.
     *
     * @return array{ok: bool, services: array[], error: ?string}
     */
    public function fetch(ServiceProvider $serviceProvider): array
    {
        $config = optional(
            $serviceProvider->serviceProviderConfiguration->services_configuration
        );

        $formData = collect($config->params)->mapWithKeys(function ($param) use ($serviceProvider) {
            if ($param->type === 'custom') {
                return [$param->key => $param->value];
            }
            if ($param->type === 'default_parameter') {
                return [
                    $param->key => collect($serviceProvider->default_parameters)
                        ->pluck('value', 'key')
                        ->get($param->key),
                ];
            }

            return [];
        })->toArray();

        $response = Http::asForm()
            ->withoutVerifying()
            ->timeout(120)
            ->send(
                $config->method,
                $config->endpoint,
                ['form_params' => $formData]
            );

        if (!$response->successful() || empty($response->body())) {
            return ['ok' => false, 'services' => [], 'error' => 'HTTP gagal'];
        }

        $rawServices = data_get(
            $response->object(),
            $config->parse_response->looping,
            []
        );

        if (!is_array($rawServices) || empty($rawServices)) {
            return ['ok' => false, 'services' => [], 'error' => 'Respons tidak berisi layanan'];
        }

        $rate = $serviceProvider->locale->usd_rate;
        $profitConfig = $config->profit_configs;

        $mappedServices = [];

        foreach ($rawServices as $service) {
            $serviceId = data_get($service, $config->parse_response->id);

            if (!$serviceId) {
                continue;
            }

            $basePrice = data_get($service, $config->parse_response->price) / $rate;

            $profit = $profitConfig->type === 'fixed'
                ? $profitConfig->value
                : ($profitConfig->value / 100) * $basePrice;

            $mappedServices[] = [
                'service_provider_service_id' => $serviceId,
                'original_price' => $basePrice,
                'price' => $basePrice + $profit,
                'profit' => $profit,
                'min' => (int) data_get($service, $config->parse_response->min),
                'max' => (int) data_get($service, $config->parse_response->max),
                'description' => $config->parse_response->description
                    ? data_get($service, $config->parse_response->description)
                    : null,
            ];
        }

        if (empty($mappedServices)) {
            return ['ok' => false, 'services' => [], 'error' => 'Tidak ada layanan valid'];
        }

        // Deskripsi tambahan: bila API tidak menyediakan, coba ambil per-layanan.
        if (!empty($mappedServices) && collect($mappedServices)->contains(fn($s) => empty($s['description']))) {
            $this->fillMissingDescriptions($config, $mappedServices);
        }

        // Normalisasi semua deskripsi ke teks polos ber-newline (tag <br> dsb. dari
        // provider diubah jadi newline agar tidak tampil literal di UI).
        foreach ($mappedServices as $index => $mappedService) {
            if (!empty($mappedService['description'])) {
                $mappedServices[$index]['description'] = $this->normalizeDescription($mappedService['description']);
            }
        }

        return ['ok' => true, 'services' => $mappedServices, 'error' => null];
    }

    /**
     * Ambil deskripsi untuk id layanan provider tertentu, urut prioritas sumber:
     * 1. Scrape bulk JSON inline halaman provider (config descriptions_scrape).
     * 2. Endpoint JSON per-layanan (config descriptions_endpoint) untuk id yang masih kosong.
     * 3. API provider (fetch()) — hanya bila scrape & endpoint tidak diaktifkan
     *    dan parse_response.description terisi (fetch() tidak melakukan request tambahan).
     *
     * @return array<int, string> map [service_provider_service_id => description] (hanya id di $serviceIds, deskripsi non-empty).
     */
    public function descriptionsForIds(ServiceProvider $serviceProvider, array $serviceIds): array
    {
        $config = optional(
            $serviceProvider->serviceProviderConfiguration->services_configuration
        );

        $wanted = array_flip($serviceIds);
        $descriptions = [];

        // 1) Scrape bulk JSON inline halaman provider.
        if (!empty($config->descriptions_scrape->enabled)) {
            try {
                $scraped = $this->scrapeDescriptions($config->descriptions_scrape);

                foreach ($scraped as $id => $description) {
                    if (isset($wanted[$id]) && is_string($description) && trim($description) !== '') {
                        $descriptions[$id] = $this->normalizeDescription($description);
                    }
                }
            } catch (\Throwable $e) {
                // Non-fatal: lanjut ke sumber berikutnya.
            }
        }

        // 2) Endpoint JSON per-layanan untuk id yang masih kosong.
        if (!empty($config->descriptions_endpoint->enabled)) {
            $missingIds = array_values(array_filter($serviceIds, function ($id) use ($descriptions) {
                return !isset($descriptions[$id]);
            }));

            if (!empty($missingIds)) {
                try {
                    $synthetic = array_map(
                        fn ($id) => ['service_provider_service_id' => $id, 'description' => null],
                        $missingIds
                    );

                    $this->fillFromPerServiceEndpoint($config->descriptions_endpoint, $synthetic);

                    foreach ($synthetic as $item) {
                        if (!empty($item['description'])
                            && isset($wanted[$item['service_provider_service_id']])
                        ) {
                            $descriptions[$item['service_provider_service_id']] = $this->normalizeDescription($item['description']);
                        }
                    }
                } catch (\Throwable $e) {
                    // Non-fatal.
                }
            }
        }

        // 3) API provider (parse_response.description) — hanya bila scrape & endpoint tidak diaktifkan.
        if (empty($config->descriptions_scrape->enabled)
            && empty($config->descriptions_endpoint->enabled)
            && !empty($config->parse_response->description)
        ) {
            try {
                $result = $this->fetch($serviceProvider);

                if (!empty($result['ok']) && !empty($result['services'])) {
                    foreach ($result['services'] as $mapped) {
                        $id = $mapped['service_provider_service_id'];

                        if (isset($wanted[$id])
                            && isset($mapped['description'])
                            && is_string($mapped['description'])
                            && trim($mapped['description']) !== ''
                        ) {
                            $descriptions[$id] = $this->normalizeDescription($mapped['description']);
                        }
                    }
                }
            } catch (\Throwable $e) {
                // Non-fatal.
            }
        }

        return $descriptions;
    }

    /**
     * Isi deskripsi yang masih kosong dari sumber per-layanan, urut prioritas:
     * 1. Endpoint standar Perfect Panel: GET {base}/services/get-service-description/{id} (JSON).
     * 2. Scrape JSON inline halaman services (config descriptions_scrape) — untuk panel non-Perfect-Panel.
     * Gagal bersifat non-fatal: layanan tetap tersinkron tanpa deskripsi.
     */
    protected function fillMissingDescriptions(object $config, array &$mappedServices): void
    {
        // 1) Endpoint standar platform Perfect Panel (banyak panel SMM memakainya).
        if (!empty($config->descriptions_endpoint->enabled)) {
            $this->fillFromPerServiceEndpoint($config->descriptions_endpoint, $mappedServices);
        }

        // 2) Scrape JSON inline halaman services (untuk panel non-Perfect-Panel).
        if (!empty($config->descriptions_scrape->enabled)) {
            $descriptions = $this->scrapeDescriptions($config->descriptions_scrape);

            if (!empty($descriptions)) {
                foreach ($mappedServices as $index => $mappedService) {
                    if (empty($mappedService['description'])
                        && array_key_exists($mappedService['service_provider_service_id'], $descriptions)
                        && !empty($descriptions[$mappedService['service_provider_service_id']])
                    ) {
                        $mappedServices[$index]['description'] = $descriptions[$mappedService['service_provider_service_id']];
                    }
                }
            }
        }
    }

    /**
     * Ambil deskripsi via endpoint JSON per layanan secara BATCH (Http::pool),
     * pola Perfect Panel: {base}/services/get-service-description/{id} -> {"description": "..."}.
     * Konkurensi & jumlah request dibatasi agar tidak membombardir provider.
     *
     * @return bool true bila minimal satu deskripsi berhasil diambil.
     */
    protected function fillFromPerServiceEndpoint(object $endpointConfig, array &$mappedServices): bool
    {
        $urlTemplate = $endpointConfig->url_template ?? '';

        if ($urlTemplate === '' || empty($endpointConfig->description_field)) {
            return false;
        }

        // Hanya layanan yang belum punya deskripsi, dibatasi max_requests per siklus.
        $maxRequests = (int) ($endpointConfig->max_requests ?? 300);
        $concurrency = max(1, (int) ($endpointConfig->concurrency ?? 20));
        $timeout = (int) ($endpointConfig->timeout ?? 15);

        $pending = [];
        foreach ($mappedServices as $index => $mappedService) {
            if (count($pending) >= $maxRequests) {
                break;
            }
            if (empty($mappedService['description'])) {
                $pending[$index] = str_replace('{id}', (string) $mappedService['service_provider_service_id'], $urlTemplate);
            }
        }

        if (empty($pending)) {
            return false;
        }

        $filled = false;

        try {
            foreach (array_chunk($pending, $concurrency, true) as $chunk) {
                $responses = Http::pool(function ($pool) use ($chunk, $timeout) {
                    foreach ($chunk as $url) {
                        $pool->as($url)
                            ->withHeaders([
                                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                                'X-Requested-With' => 'XMLHttpRequest',
                            ])
                            ->withoutVerifying()
                            ->timeout($timeout)
                            ->get($url);
                    }
                });

                foreach ($responses as $url => $response) {
                    $index = array_search($url, $chunk, true);

                    if ($index === false || !$response || !$response->successful()) {
                        continue;
                    }

                    $payload = $response->json();

                    if (!is_array($payload)) {
                        continue;
                    }

                    $description = data_get($payload, $endpointConfig->description_field);

                    if (is_string($description) && trim($description) !== '') {
                        $mappedServices[$index]['description'] = $description;
                        $filled = true;
                    }
                }
            }
        } catch (\Throwable $e) {
            return $filled;
        }

        return $filled;
    }

    /**
     * Normalisasi deskripsi dari provider menjadi teks polos dengan newline:
     * - Tag <br>, <br/>, <br /> (case-insensitive, dengan atribut) -> newline.
     * - Tag <p>...</p> -> dibungkus newline.
     * - Satu baris baru maksimal (CRLF/CR -> LF, newline ganda maksimal).
     * - Entity HTML umum di-decode (tanpa membuka celah tag baru).
     *
     * Alasan: GOP mengirim deskripsi berformat HTML (<br />) yang akan tampil
     * literal di UI yang merender deskripsi sebagai teks pre-line.
     * Public: juga dipakai alur fetch lama di ServiceController.
     */
    public function normalizeDescription(?string $description): ?string
    {
        if ($description === null) {
            return null;
        }

        $text = $description;

        // Decode entity dulu agar &lt;br&gt; ikut tertangani; hanya entity aman
        // yang dikembalikan (htmlspecialchars dengan flag entitas dikutip).
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // <br> varian apa pun (+ whitespace/newline setelahnya) -> SATU newline,
        // agar "<br />\n" dari provider tidak menjadi baris kosong ganda.
        $text = preg_replace('/<br\s*\/?>\s*(?:\r\n|\r|\n)?/i', "\n", $text);

        // </p> atau <p> -> newline (paragraf).
        $text = preg_replace('/<\/p\s*>|<p\b[^>]*>/i', "\n", $text);

        // Lepas tag HTML lain yang tersisa (tanpa membuka celah: tag dibuang, bukan dieksekusi).
        $text = strip_tags($text);

        // Normalisasi whitespace per baris + newline maksimal ganda.
        $lines = preg_split('/\r\n|\r|\n/', $text);
        $lines = array_map(fn ($line) => trim($line), $lines);

        $result = [];
        $blank = 0;
        foreach ($lines as $line) {
            if ($line === '') {
                $blank++;
                if ($blank > 1) {
                    continue; // maksimal satu baris kosong berurutan
                }
                $result[] = '';
                continue;
            }
            $blank = 0;
            $result[] = $line;
        }

        $text = implode("\n", $result);

        return trim($text) === '' ? null : trim($text);
    }

    /**
     * Scrape JSON inline (window.{data_key} = [...]) dari halaman provider,
     * kembalikan map [id => description].
     */
    protected function scrapeDescriptions(object $scrapeConfig): array
    {
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            ])
                ->withoutVerifying()
                ->timeout(180)
                ->get($scrapeConfig->url);

            if (!$response->successful() || empty($response->body())) {
                return [];
            }

            $body = $response->body();

            $json = $this->extractInlineJson($body, $scrapeConfig->data_key);

            if ($json === null) {
                return [];
            }

            $items = json_decode($json);

            if (!is_array($items)) {
                return [];
            }

            $idField = $scrapeConfig->id_field;
            $descriptionField = $scrapeConfig->description_field;

            $descriptions = [];

            foreach ($items as $item) {
                $id = data_get($item, $idField);

                if (!$id) {
                    continue;
                }

                $descriptions[$id] = data_get($item, $descriptionField);
            }

            return $descriptions;
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Ekstrak payload JSON inline `window.{dataKey} = [...];` dari body HTML,
     * dengan fallback bertahap bila JSON mengandung literal `];` di dalam string.
     */
    protected function extractInlineJson(string $body, string $dataKey): ?string
    {
        if (preg_match('/window\.' . preg_quote($dataKey, '/') . '\s*=\s*(\[.*?\]);/s', $body, $matches)) {
            if (json_decode($matches[1]) !== null) {
                return $matches[1];
            }
        }

        // Fallback: decode prefix yang berakhir di tiap kemunculan `];` berikutnya.
        $start = strpos($body, '= [');

        if ($start === false) {
            return null;
        }

        $offset = $start + 2;

        while (($end = strpos($body, '];', $offset)) !== false) {
            $candidate = substr($body, $start + 2, $end - $start - 1);

            $decoded = json_decode($candidate);

            if ($decoded !== null && is_array($decoded)) {
                return $candidate;
            }

            $offset = $end + 1;
        }

        return null;
    }
}

<?php

namespace App\Http\Controllers\Cronjob;

use App\Http\Controllers\Controller;
use App\Jobs\Service\SyncServicesFromProviderJob;
use App\Jobs\Service\UpsertProviderServiceJob;
use App\Models\Service\Service;
use App\Models\Service\ServiceProvider;
use App\Models\Service\ServiceProviderService;
use App\Models\Service\ServiceUpdate;
use App\Services\General\Service\ProviderServicesFetcher;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Endpoint cron HTTP untuk layanan provider (pola guard sama dengan
 * Cronjob\OrderController): sinkron layanan (semua / per provider) secara
 * INLINE (job di-handle() langsung, tanpa queue worker) dan pengecekan
 * ketersediaan layanan live di provider (Http::pool ringan, tanpa scraper).
 */
class ServiceController extends Controller
{
    /**
     * Endpoint cron HTTP: /cron/sync-services
     * Sinkron layanan semua provider type=auto berstatus aktif (inline).
     */
    public function syncServices()
    {
        $this->verifyCronSecret();
        set_time_limit(0);

        $providers = ServiceProvider::query()
            ->whereHas('serviceProviderConfiguration')
            ->where('type', 'auto')
            ->where('status', '1')
            ->with(['serviceProviderConfiguration', 'locale'])
            ->orderBy('id')
            ->get();

        if ($providers->isEmpty()) {
            return response()->json([
                'ok'    => false,
                'error' => 'Tidak ada provider auto aktif dengan konfigurasi layanan.',
            ], 400);
        }

        $results = [];

        foreach ($providers as $serviceProvider) {
            $results[] = $this->doSyncProvider($serviceProvider);
        }

        return response()->json([
            'ok'        => collect($results)->every(fn ($result) => $result['ok'] === true),
            'providers' => $results,
        ]);
    }

    /**
     * Endpoint cron HTTP: /cron/sync-services-by-id/{target:id}
     * Sinkron layanan satu provider (route model binding ServiceProvider).
     */
    public function syncServicesByID(ServiceProvider $target)
    {
        $this->verifyCronSecret();
        set_time_limit(0);

        if ($target->type !== 'auto') {
            abort(404);
        }

        $target->load(['serviceProviderConfiguration', 'locale']);

        return response()->json([
            'ok'       => true,
            'provider' => $this->doSyncProvider($target),
        ]);
    }

    /**
     * Endpoint cron HTTP: /cron/check-service-status
     * Cek ketersediaan layanan live di provider via Http::pool ke endpoint
     * services_configuration (ringan, tanpa ProviderServicesFetcher), lalu
     * nonaktifkan layanan lokal yang hilang / aktifkan yang kembali ada
     * + log ServiceUpdate. Provider tanpa endpoint / request gagal: skip.
     */
    public function checkServiceStatus()
    {
        $this->verifyCronSecret();
        // Pool menunggu provider lambat (timeout 300s); PHP Windows menghitung
        // max_execution_time sebagai wall-clock, jadi harus diangkat.
        set_time_limit(0);

        // ID layanan lokal yang aktif, dikelompokkan per provider.
        $groupedActiveServices = Service::query()
            ->where('status', '1')
            ->get(['service_provider_id', 'service_provider_service_id'])
            ->groupBy('service_provider_id')
            ->map(fn ($group) => $group->pluck('service_provider_service_id')->all())
            ->all();

        $serviceProviders = ServiceProvider::query()
            ->where('type', 'auto')
            ->where('status', '1')
            ->whereHas('serviceProviderConfiguration')
            ->has('services')
            ->with('serviceProviderConfiguration')
            ->get()
            ->filter(function (ServiceProvider $serviceProvider) {
                $config = optional($serviceProvider->serviceProviderConfiguration->services_configuration);

                // Sama seperti panel lama: cukup endpoint terisi. `looping` boleh
                // null (respons array top-level -> data_get mengembalikan seluruh
                // objek respons), sedangkan `id` wajib ada agar ID live valid.
                return !empty($config->endpoint)
                    && !empty($config->parse_response->id);
            })
            ->values();

        $responses = Http::pool(function (Pool $pool) use ($serviceProviders) {
            foreach ($serviceProviders as $serviceProvider) {
                $config = optional($serviceProvider->serviceProviderConfiguration->services_configuration);

                $pool->as($serviceProvider->id)
                    ->withOptions(['timeout' => 300, 'verify' => false])
                    ->send(
                        $config->method,
                        $config->endpoint,
                        ['form_params' => $this->servicesConfigurationFormData($serviceProvider, $config)]
                    );
            }
        });

        $results = [];

        foreach ($responses as $serviceProviderId => $response) {
            $serviceProvider = $serviceProviders->firstWhere('id', $serviceProviderId);

            if (!$serviceProvider) {
                continue;
            }

            try {
                // Timeout / koneksi gagal -> pool mengembalikan Throwable.
                if ($response instanceof Throwable) {
                    $results[] = [
                        'provider' => $serviceProvider->name,
                        'ok'       => false,
                        'error'    => $response->getMessage(),
                    ];
                    continue;
                }

                if (!$response instanceof Response || !$response->successful()) {
                    $results[] = [
                        'provider' => $serviceProvider->name,
                        'ok'       => false,
                        'error'    => $response instanceof Response
                            ? 'HTTP ' . $response->status()
                            : 'Respons provider tidak dapat dibaca.',
                    ];
                    continue;
                }

                $config = optional($serviceProvider->serviceProviderConfiguration->services_configuration);

                // `looping` null = respons API adalah array top-level; data_get
                // pada key null mengembalikan seluruh objek respons.
                $liveServices = data_get($response->object(), $config->parse_response->looping, []);

                if (!is_array($liveServices) || !array_filter($liveServices, fn ($item) => is_object($item))) {
                    $results[] = [
                        'provider' => $serviceProvider->name,
                        'ok'       => false,
                        'error'    => 'Respons tidak berisi daftar layanan.',
                    ];
                    continue;
                }

                $liveServiceIds = [];

                foreach ($liveServices as $liveService) {
                    $liveServiceId = data_get($liveService, $config->parse_response->id);
                    if ($liveServiceId) {
                        $liveServiceIds[] = $liveServiceId;
                    }
                }

                $result = [
                    'provider'    => $serviceProvider->name,
                    'ok'          => true,
                    'checked_ids' => count($liveServiceIds),
                    'disabled'    => 0,
                    'enabled'     => 0,
                ];

                // Layanan lokal aktif yang hilang dari provider -> nonaktifkan.
                $localActiveIds = $groupedActiveServices[$serviceProvider->id] ?? [];
                $missingIds = array_diff($localActiveIds, $liveServiceIds);

                if (!empty($missingIds)) {
                    Service::query()
                        ->where('service_provider_id', $serviceProvider->id)
                        ->where('status', '1')
                        ->whereIn('service_provider_service_id', $missingIds)
                        ->get(['id', 'status'])
                        ->each(function (Service $service) use (&$result) {
                            $service->update(['status' => '0']);
                            ServiceUpdate::create([
                                'service_id'     => $service->id,
                                'type'           => 'disabled',
                                'content_key'    => 'services:updates.description.disabled',
                                'content_params' => (object) [],
                            ]);
                            $result['disabled']++;
                        });
                }

                // Layanan lokal nonaktif yang kembali ada -> aktifkan.
                Service::query()
                    ->where('service_provider_id', $serviceProvider->id)
                    ->where('status', '0')
                    ->whereIn('service_provider_service_id', $liveServiceIds)
                    ->get(['id', 'status'])
                    ->each(function (Service $service) use (&$result) {
                        $service->update(['status' => '1']);
                        ServiceUpdate::create([
                            'service_id'     => $service->id,
                            'type'           => 'enabled',
                            'content_key'    => 'services:updates.description.enabled',
                            'content_params' => (object) [],
                        ]);
                        $result['enabled']++;
                    });

                $results[] = $result;
            } catch (Throwable $e) {
                $results[] = [
                    'provider' => $serviceProvider->name,
                    'ok'       => false,
                    'error'    => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'ok'        => true,
            'providers' => $results,
        ]);
    }

    /**
     * Pipeline sinkron inline satu provider (identik dengan Admin
     * ServiceController::syncProviderServices, tanpa queue):
     * fetch -> upsert service_provider_services -> hapus baris stale ->
     * sync ke services + log ServiceUpdate.
     */
    private function doSyncProvider(ServiceProvider $serviceProvider): array
    {
        $result = [
            'provider' => $serviceProvider->name,
            'ok'       => false,
            'fetched'  => 0,
        ];

        try {
            $config = optional($serviceProvider->serviceProviderConfiguration->services_configuration);

            if (!$config || empty($config->endpoint)) {
                return $result + ['error' => 'Konfigurasi layanan provider tidak ditemukan / endpoint kosong.'];
            }

            $fetchResult = app(ProviderServicesFetcher::class)->fetch($serviceProvider);

            if (!$fetchResult['ok'] || empty($fetchResult['services'])) {
                return $result + ['error' => $fetchResult['error'] ?? 'Fetch gagal'];
            }

            $mappedServices = $fetchResult['services'];
            $result['fetched'] = count($mappedServices);

            // 1) Upsert service_provider_services (logika UpsertProviderServiceJob,
            //    inline). Dijalankan per-chunk: upsert 1 baris = 10 placeholder,
            //    jadi provider besar (>6553 layanan) akan melebihi batas 65.535
            //    placeholder MySQL bila dikirim sekaligus (SQLSTATE 1390).
            foreach (array_chunk($mappedServices, 1000) as $mappedChunk) {
                $upsertJob = new UpsertProviderServiceJob($serviceProvider->id, $mappedChunk);
                $upsertJob->handle();
            }

            // 2) Hapus layanan provider yang sudah tiada di respons terbaru.
            $incomingServiceIds = collect($mappedServices)
                ->pluck('service_provider_service_id')
                ->unique()
                ->values()
                ->all();

            ServiceProviderService::where('service_provider_id', $serviceProvider->id)
                ->whereNotIn('service_provider_service_id', $incomingServiceIds)
                ->delete();

            // 3) Terapkan ke services + log ServiceUpdate (inline), hitung
            //    disabled/enabled dari ServiceUpdate yang baru dibuat.
            $lastServiceUpdateId = (int) ServiceUpdate::query()->max('id');

            $syncJob = new SyncServicesFromProviderJob($serviceProvider->id);
            $syncJob->handle();

            $changeCounts = ServiceUpdate::query()
                ->where('id', '>', $lastServiceUpdateId)
                ->whereIn('type', ['disabled', 'enabled'])
                ->whereIn(
                    'service_id',
                    Service::query()->select('id')->where('service_provider_id', $serviceProvider->id)
                )
                ->selectRaw('type, COUNT(*) as total')
                ->groupBy('type')
                ->pluck('total', 'type');

            $result['disabled'] = (int) ($changeCounts['disabled'] ?? 0);
            $result['enabled'] = (int) ($changeCounts['enabled'] ?? 0);
            $result['ok'] = true;
        } catch (Throwable $e) {
            return $result + ['error' => $e->getMessage()];
        }

        return $result;
    }

    /**
     * Form params untuk endpoint services_configuration dari konfigurasi provider.
     */
    private function servicesConfigurationFormData(ServiceProvider $serviceProvider, object $config): array
    {
        return collect($config->params ?? [])->mapWithKeys(function ($param) use ($serviceProvider) {
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
        })->all();
    }

    /**
     * Guard secret opsional (pola Cronjob\OrderController):
     * - bila services.cron.secret terisi  -> wajib ?secret= cocok, salah/kosong = 404
     * - bila kosong                       -> endpoint boleh dipanggil tanpa secret
     */
    private function verifyCronSecret(): void
    {
        $expected = trim((string) config('services.cron.secret', ''));
        $given    = trim((string) request()->query('secret', ''));

        if ($expected !== '' && ($given === '' || !hash_equals($expected, $given))) {
            abort(404);
        }
    }
}

<?php

namespace App\Services\General\Service;

use App\Jobs\Service\SyncServicesFromProviderJob;
use App\Jobs\Service\UpsertProviderServiceJob;
use App\Models\Service\Service;
use App\Models\Service\ServiceProvider;
use App\Models\Service\ServiceProviderService;
use App\Models\Service\ServiceUpdate;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Sinkronisasi layanan provider secara INLINE (job di-handle() langsung,
 * tanpa queue worker). Dipakai bersama oleh:
 * - endpoint HTTP /tasks/* dan /cron/* (Cronjob\ServiceController)
 * - command CLI `service:sync-inline` (update lewat SSH, tanpa worker)
 *
 * Pengaman anti-dobel: atomic lock per operasi. Karena lock ada DI SINI
 * (bukan di controller), HTTP dan CLI memakai lock yang sama — sinkron
 * provider 13 lewat CLI tidak bisa dobel dengan sinkron 13 lewat HTTP.
 * TTL 300s hanya jaring pengaman bila proses mati tanpa release (finally).
 */
class ProviderServicesSyncer
{
    private const LOCK_TTL = 300;

    /**
     * Sinkron satu provider.
     * Return: ['ok' => true, 'provider' => [hasil]] — atau
     * ['ok' => false, 'busy' => true, 'error' => ...] bila sinkron provider
     * tersebut sedang berjalan (dari HTTP maupun CLI).
     */
    public function syncOne(ServiceProvider $target): array
    {
        $lock = Cache::lock("sync:provider:{$target->id}", self::LOCK_TTL);

        if (!$lock->get()) {
            return $this->busyResult();
        }

        try {
            set_time_limit(0);
            $target->load(['serviceProviderConfiguration', 'locale']);

            return [
                'ok'       => true,
                'provider' => $this->syncProvider($target),
            ];
        } finally {
            $lock->release();
        }
    }

    /**
     * Sinkron semua provider type=auto aktif.
     * Return: ['ok' => bool, 'providers' => [...]] — atau ['ok' => false,
     * 'error' => ...] bila tidak ada provider, atau busy bila sedang berjalan.
     */
    public function syncAll(): array
    {
        $lock = Cache::lock('sync:all', self::LOCK_TTL);

        if (!$lock->get()) {
            return $this->busyResult();
        }

        try {
            set_time_limit(0);

            $providers = ServiceProvider::query()
                ->whereHas('serviceProviderConfiguration')
                ->where('type', 'auto')
                ->where('status', '1')
                ->with(['serviceProviderConfiguration', 'locale'])
                ->orderBy('id')
                ->get();

            if ($providers->isEmpty()) {
                return [
                    'ok'    => false,
                    'error' => 'Tidak ada provider auto aktif dengan konfigurasi layanan.',
                ];
            }

            $results = [];

            foreach ($providers as $serviceProvider) {
                // Lock per provider: provider yang sedang disinkronkan
                // endpoint/command lain dilewati (bukan ditunggu).
                $providerLock = Cache::lock("sync:provider:{$serviceProvider->id}", self::LOCK_TTL);

                if (!$providerLock->get()) {
                    $results[] = [
                        'provider' => $serviceProvider->name,
                        'ok'       => false,
                        'fetched'  => 0,
                        'error'    => 'Dilewati: sinkronisasi provider ini sedang berjalan.',
                    ];
                    continue;
                }

                try {
                    $results[] = $this->syncProvider($serviceProvider);
                } finally {
                    $providerLock->release();
                }
            }

            return [
                'ok'        => collect($results)->every(fn ($result) => $result['ok'] === true),
                'providers' => $results,
            ];
        } finally {
            $lock->release();
        }
    }

    /**
     * Cek ketersediaan layanan live di semua provider (Http::pool ke endpoint
     * services_configuration), lalu nonaktifkan layanan lokal yang hilang /
     * aktifkan yang kembali ada + log ServiceUpdate.
     * Return: ['ok' => true, 'providers' => [...]] atau busy.
     */
    public function checkStatuses(): array
    {
        $lock = Cache::lock('sync:check-status', self::LOCK_TTL);

        if (!$lock->get()) {
            return $this->busyResult();
        }

        try {
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

            return [
                'ok'        => true,
                'providers' => $results,
            ];
        } finally {
            $lock->release();
        }
    }

    /**
     * Pipeline sinkron inline satu provider (identik dengan Admin
     * ServiceController::syncProviderServices, tanpa queue):
     * fetch -> upsert service_provider_services -> hapus baris stale ->
     * sync ke services + log ServiceUpdate.
     */
    private function syncProvider(ServiceProvider $serviceProvider): array
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
     * Hasil bila operasi ditolak karena sinkron lain sedang berjalan.
     */
    private function busyResult(): array
    {
        return [
            'ok'    => false,
            'busy'  => true,
            'error' => 'Sinkronisasi masih berjalan. Coba lagi nanti.',
        ];
    }
}

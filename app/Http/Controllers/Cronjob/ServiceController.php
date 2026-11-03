<?php

namespace App\Http\Controllers\Cronjob;

use App\Http\Controllers\Controller;
use App\Models\Service\ServiceProvider;
use App\Services\General\Service\ProviderServicesSyncer;

/**
 * Endpoint cron HTTP untuk layanan provider:
 * - /cron/* (lama, dengan secret opsional) — DIBLOK rule nginx/WAF di VPS
 * - /tasks/* (baru, tanpa secret) — penggantinya di VPS
 *
 * Semua logika (sinkron inline tanpa queue worker + lock anti-dobel) ada di
 * ProviderServicesSyncer, dipakai bersama command CLI `service:sync-inline`.
 */
class ServiceController extends Controller
{
    /**
     * Endpoint cron HTTP: /cron/sync-services dan /tasks/sync-services
     * Sinkron layanan semua provider type=auto berstatus aktif (inline).
     */
    public function syncServices()
    {
        $this->guardCronSecret();

        return $this->jsonResult(app(ProviderServicesSyncer::class)->syncAll());
    }

    /**
     * Endpoint cron HTTP: /cron/sync-services-by-id/{target:id} dan
     * /tasks/sync-services-by-id/{target:id}
     * Sinkron layanan satu provider (route model binding ServiceProvider).
     */
    public function syncServicesByID(ServiceProvider $target)
    {
        $this->guardCronSecret();

        if ($target->type !== 'auto') {
            abort(404);
        }

        return $this->jsonResult(app(ProviderServicesSyncer::class)->syncOne($target));
    }

    /**
     * Endpoint cron HTTP: /cron/check-service-status dan /tasks/check-service-status
     * Cek ketersediaan layanan live di provider (Http::pool ringan, tanpa
     * scraper), lalu nonaktifkan layanan lokal yang hilang / aktifkan yang
     * kembali ada + log ServiceUpdate.
     */
    public function checkServiceStatus()
    {
        $this->guardCronSecret();

        return $this->jsonResult(app(ProviderServicesSyncer::class)->checkStatuses());
    }

    /**
     * Guard secret HANYA untuk endpoint /cron/* (nama route berawalan
     * "cron."): /tasks/* bebas secret sesuai pola admin-smm. Bila
     * services.cron.secret kosong, /cron/* juga bebas (perilaku lama).
     */
    private function guardCronSecret(): void
    {
        if (!str_starts_with(request()->route()->getName() ?? '', 'cron.')) {
            return;
        }

        $expected = trim((string) config('services.cron.secret', ''));
        $given    = trim((string) request()->query('secret', ''));

        if ($expected !== '' && ($given === '' || !hash_equals($expected, $given))) {
            abort(404);
        }
    }

    /**
     * Bungkus hasil syncer menjadi respons JSON; operasi yang ditolak karena
     * sinkron lain sedang berjalan -> 409.
     */
    private function jsonResult(array $result)
    {
        if (!empty($result['busy'])) {
            return response()->json([
                'ok'    => false,
                'error' => $result['error'] ?? 'Sinkronisasi masih berjalan. Coba lagi nanti.',
            ], 409);
        }

        return response()->json($result);
    }
}

<?php

namespace App\Console\Commands\Service;

use App\Models\Service\ServiceProvider;
use App\Services\General\Service\ProviderServicesSyncer;
use Illuminate\Console\Command;

/**
 * Sinkron layanan provider secara INLINE (tanpa queue worker) lewat SSH/CLI.
 * Logika & lock anti-dobel sama dengan endpoint HTTP /tasks/* — update harga
 * layanan bisa dijalankan dari terminal VPS tanpa lewat HTTP sama sekali.
 *
 * Contoh:
 *   php artisan service:sync-inline                  # semua provider auto aktif
 *   php artisan service:sync-inline --provider=13    # satu provider (GOP)
 *   php artisan service:sync-inline --check-status   # cek layanan hilang/muncul
 */
class SyncInline extends Command
{
    protected $signature = 'service:sync-inline
                            {--provider= : ID provider tertentu (mis. 13); bila diabaikan, semua provider auto aktif}
                            {--check-status : Cek ketersediaan layanan live di provider (tanpa sinkron harga)}';

    protected $description = 'Sinkron layanan provider tanpa queue worker (inline: fetch -> upsert -> sync langsung jalan)';

    public function handle(): int
    {
        $syncer = app(ProviderServicesSyncer::class);

        if ($this->option('check-status')) {
            return $this->runCheckStatus($syncer);
        }

        if ($providerId = $this->option('provider')) {
            return $this->runOne($syncer, (int) $providerId);
        }

        return $this->runAll($syncer);
    }

    private function runCheckStatus(ProviderServicesSyncer $syncer): int
    {
        $this->info('Mengecek ketersediaan layanan live di provider...');

        $result = $syncer->checkStatuses();
        $this->render($result);

        return $this->exitCode($result);
    }

    private function runOne(ProviderServicesSyncer $syncer, int $providerId): int
    {
        $provider = ServiceProvider::query()
            ->where('type', 'auto')
            ->find($providerId);

        if (!$provider) {
            $this->error("Provider ID {$providerId} tidak ditemukan / bukan type auto.");

            return self::FAILURE;
        }

        $this->info("Sinkron provider: {$provider->name} (ID {$provider->id})");

        $result = $syncer->syncOne($provider);
        $this->render($result);

        return $this->exitCode($result);
    }

    private function runAll(ProviderServicesSyncer $syncer): int
    {
        $this->info('Sinkron SEMUA provider auto aktif (berurutan; provider yang sedang disinkronkan proses lain dilewati)...');

        $result = $syncer->syncAll();
        $this->render($result);

        return $this->exitCode($result);
    }

    /**
     * Tampilkan hasil sinkron dalam bentuk tabel ringkas.
     */
    private function render(array $result): void
    {
        if (!empty($result['busy'])) {
            $this->warn($result['error'] ?? 'Sinkronisasi masih berjalan. Coba lagi nanti.');

            return;
        }

        // Hasil syncOne berbentuk ['ok' => ..., 'provider' => [...]] (tunggal) —
        // samakan bentuknya dengan syncAll agar cukup satu tabel render.
        if (array_key_exists('provider', $result)) {
            $result = [
                'ok'        => $result['ok'] ?? false,
                'providers' => [$result['provider']],
            ];
        }

        if (empty($result['providers'])) {
            $this->warn($result['error'] ?? 'Tidak ada hasil.');

            return;
        }

        $this->table(
            ['Provider', 'OK', 'Fetched', 'Disabled', 'Enabled', 'Error'],
            collect($result['providers'])->map(fn ($row) => [
                $row['provider'] ?? '-',
                ($row['ok'] ?? false) ? 'ya' : 'TIDAK',
                $row['fetched'] ?? ($row['checked_ids'] ?? '-'),
                $row['disabled'] ?? '-',
                $row['enabled'] ?? '-',
                $row['error'] ?? '-',
            ])->all()
        );

        $this->info(($result['ok'] ?? false) ? 'Selesai: OK.' : 'Selesai: ada provider yang gagal (lihat kolom Error).');
    }

    private function exitCode(array $result): int
    {
        return ($result['ok'] ?? false) ? self::SUCCESS : self::FAILURE;
    }
}

<?php

namespace App\Console\Commands;

use App\Models\Locale;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class KursSync extends Command
{
    protected $signature = 'kurs:sync {--locale= : Kode locale tertentu, mis. id}';

    protected $description = 'Sinkronisasi kurs (Yahoo Finance → fallback open.er-api.com) ke tabel locales: usd_rate (jual), usd_rate_buy (beli)';

    public function handle()
    {
        try {
            if (!config('services.kurs.enabled', true)) {
                $this->info('Sinkronisasi kurs dinonaktifkan (KURS_SYNC_ENABLED=false).');

                return self::SUCCESS;
            }

            $spread = min(10, max(0, (float) config('services.kurs.spread_percent', 1.0)));

            $query = Locale::where('status', '1');
            if ($this->option('locale')) {
                $query->where('locale', $this->option('locale'));
            }

            $locales = $query->get();

            // Fallback er-api hanya ditarik sekali per run, dibagikan antar locale.
            $erapiRates = null;

            $targets = 0;
            foreach ($locales as $l) {
                try {
                    $currency = strtoupper((string) $l->currency_code);

                    // Basis USD tidak perlu kurs, dan locale dgn kurs_auto mati dilewati.
                    if ($currency === 'USD' || $currency === '') {
                        continue;
                    }
                    if (in_array($l->kurs_auto, [1, '1', true], true) === false) {
                        $this->line($l->locale.': dilewati (kurs_auto mati).');

                        continue;
                    }
                    $targets++;

                    $tengah = null;
                    $sumber = null;

                    // 1) Yahoo Finance — ticker langsung USD{CUR}=X, lalu terbalik {CUR}USD=X.
                    try {
                        $resp = Http::withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; kurs-sync/1.0)'])
                            ->timeout(8)
                            ->get('https://query1.finance.yahoo.com/v8/finance/chart/USD'.$currency.'=X', [
                                'interval' => '1m',
                                'range' => '1d',
                            ]);
                        $meta = $resp->json('chart.result.0.meta');
                        $price = $meta['regularMarketPrice'] ?? null;
                        $chartError = $resp->json('chart.error');

                        if (is_numeric($price) && $price > 0 && !$chartError) {
                            $tengah = (float) $price;
                            $sumber = 'Yahoo Finance (realtime)';
                        } else {
                            throw new \RuntimeException('Ticker USD'.$currency.'=X tidak memberi harga.');
                        }
                    } catch (\Throwable $e) {
                        try {
                            $resp = Http::withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; kurs-sync/1.0)'])
                                ->timeout(8)
                                ->get('https://query1.finance.yahoo.com/v8/finance/chart/'.$currency.'USD=X', [
                                    'interval' => '1m',
                                    'range' => '1d',
                                ]);
                            $meta = $resp->json('chart.result.0.meta');
                            $price = $meta['regularMarketPrice'] ?? null;

                            if (is_numeric($price) && $price > 0) {
                                $tengah = 1 / (float) $price;
                                $sumber = 'Yahoo Finance (realtime, invers)';
                            } else {
                                throw new \RuntimeException('Ticker '.$currency.'USD=X tidak memberi harga.');
                            }
                        } catch (\Throwable $e2) {
                            $this->warn('Yahoo gagal untuk '.$currency.': '.$e2->getMessage());
                        }
                    }

                    // 2) Fallback open.er-api.com — harian, ditarik sekali per run.
                    if ($tengah === null) {
                        if ($erapiRates === null) {
                            try {
                                $data = Http::timeout(10)->get('https://open.er-api.com/v6/latest/USD')->json();
                                if (($data['result'] ?? null) === 'success' && isset($data['rates'][$currency])
                                    && is_numeric($data['rates'][$currency]) && $data['rates'][$currency] > 0) {
                                    $erapiRates = $data['rates'];
                                }
                            } catch (\Throwable $e) {
                                $this->warn('Fallback open.er-api.com gagal: '.$e->getMessage());
                            }
                        }
                        if (is_array($erapiRates) && isset($erapiRates[$currency])
                            && is_numeric($erapiRates[$currency]) && $erapiRates[$currency] > 0) {
                            $tengah = (float) $erapiRates[$currency];
                            $sumber = 'exchangerate-api (harian)';
                        }
                    }

                    // Semua sumber gagal → lewati locale ini, lanjut berikutnya.
                    if ($tengah === null) {
                        $this->warn($currency.': kurs tidak tersedia dari semua sumber, dilewati.');

                        continue;
                    }

                    $jual = round($tengah * (1 + $spread / 200), 6);
                    $beli = round($tengah * (1 - $spread / 200), 6);

                    $l->update([
                        'kurs_tengah' => round($tengah, 6),
                        'usd_rate' => $jual,
                        'usd_rate_buy' => $beli,
                        'kurs_source' => substr($sumber.' (spread '.$spread.'%)', 0, 100),
                        'kurs_synced_at' => now(),
                    ]);

                    $this->info($l->locale.': tengah='.round($tengah, 6).' jual='.$jual.' beli='.$beli.' ('.$sumber.')');
                } catch (\Throwable $e) {
                    $this->warn('Gagal memproses locale '.($l->locale ?? '?').': '.$e->getMessage());
                }
            }

            // Cache 'locales' dipakai share props Inertia + helper format_currency (TTL 6 jam).
            // Tanpa flush ini, kurs baru tidak terlihat sampai cache kedaluwarsa.
            Cache::forget('locales');

            if ($targets === 0) {
                $this->info('Tidak ada locale target untuk sinkronisasi kurs.');
            }

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('kurs:sync gagal: '.$e->getMessage());

            return self::FAILURE;
        }
    }
}

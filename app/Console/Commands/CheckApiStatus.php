<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CheckApiStatus extends Command
{
    protected $signature = 'api:check-status';
    protected $description = 'Pengecekan status API dengan HTTP pool dan delay per batch';

    public function handle()
    {
        $endpoints = array_fill(0, 30, "https://example.com/api/1");

        $batchSize = 5;
        $totalBatches = ceil(count($endpoints) / $batchSize);

        $this->info("Menjalankan {$totalBatches} batch dengan total " . count($endpoints) . " request...");

        $chunks = array_chunk($endpoints, $batchSize);

        foreach ($chunks as $batchIndex => $batch) {

            $this->info("➡️ Batch " . ($batchIndex + 1) . " dari {$totalBatches} sedang dijalankan...");

            $responses = Http::pool(function ($pool) use ($batch) {
                foreach ($batch as $key => $url) {
                    $pool->as("req_" . uniqid())->timeout(120)->get($url);
                }
            });

            foreach ($responses as $key => $response) {
                $url = "https://example.com/api/1";
                Log::info("[API-CHECK] SUCCESS", [
                    'url' => $url,
                ]);
                // if ($response->successful()) {
                //     $this->info("✔ SUCCESS: $url");
                //     Log::info("[API-CHECK] SUCCESS", [
                //         'url' => $url,
                //         'response' => $response->json()
                //     ]);
                // } else {
                //     $this->error("❌ FAILED: $url ({$response->status()})");
                //     Log::warning("[API-CHECK] FAILED", [
                //         'url' => $url,
                //         'status' => $response->status(),
                //         'response' => $response->body()
                //     ]);
                // }
            }

            if ($batchIndex < $totalBatches - 1) {
                $this->info("⏳ Menunggu 30 detik sebelum batch berikutnya...");
                sleep(30);
            }
        }

        $this->info("🎉 Selesai! Semua request telah dijalankan.");
        Log::info("=== API POOL CHECK COMPLETED ===");
    }
}

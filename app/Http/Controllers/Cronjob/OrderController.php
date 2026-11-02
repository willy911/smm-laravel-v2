<?php

namespace App\Http\Controllers\Cronjob;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Artisan;

class OrderController extends Controller
{
    /**
     * Endpoint cron HTTP: /cron/check-status
     * Menjalankan console command `order:status-order`.
     */
    public function checkStatus()
    {
        return $this->runCommand('order:status-order');
    }

    /**
     * Endpoint cron HTTP: /cron/check-status-refill
     * Menjalankan console command `order:status-order-refill`.
     */
    public function checkStatusRefill()
    {
        return $this->runCommand('order:status-order-refill');
    }

    /**
     * Endpoint cron HTTP: /cron/send-order
     * Menjalankan console command `order:send-order`.
     */
    public function sendOrder()
    {
        return $this->runCommand('order:send-order');
    }

    /**
     * Guard secret opsional + eksekusi console command via Artisan.
     * Pola sama dengan /cron/run/{secret} di routes/web.php:
     * - bila services.cron.secret terisi  -> wajib ?secret= cocok, salah/kosong = 404
     * - bila kosong                       -> endpoint boleh dipanggil tanpa secret
     */
    private function runCommand(string $command): \Illuminate\Http\JsonResponse
    {
        $expected = trim((string) config('services.cron.secret', ''));
        $given    = trim((string) request()->query('secret', ''));

        if ($expected !== '' && ($given === '' || !hash_equals($expected, $given))) {
            abort(404);
        }

        try {
            Artisan::call($command);

            return response()->json([
                'ok'      => true,
                'command' => $command,
                'output'  => Artisan::output(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'ok'    => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

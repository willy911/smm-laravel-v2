<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| Konversi satuan uang legacy (rupiah-mentah) -> kredit internal (USD)
|--------------------------------------------------------------------------
|
| Sistem panel ini menyimpan uang internal dalam SATUAN KREDIT (setara USD).
| Tampilan UI mengalikan nilai dengan kurs (locales.usd_rate) untuk
| menampilkan rupiah, dan deposit mengkreditkan nominal / kurs_beli.
|
| MASALAH: data hasil impor panel lama masih dalam rupiah-mentah, sehingga
| tampilan UI menjadi kelipatan ~18 ribu. Contoh: user pasepstecu (id 84)
| punya balance 11787 di DB yang sebenarnya Rp 11.787, tapi UI menampilkan
| "Rp 214 juta" (11787 x kurs).
|
| Migration ini MENGKONVERSI (satu kali, tidak bisa dibalik tanpa kurs
| masuk) semua nilai rupiah-mentah menjadi kredit dengan rumus:
|
|     nilai_kredit = ROUND(nilai_rupiah / kurs_beli, 8)
|
| Kurs diambil LIVE saat migration berjalan dari tabel `locales` id=1:
|   - utamakan `usd_rate_buy` (kurs beli, sesuai logika deposit)
|   - fallback ke `usd_rate` bila usd_rate_buy kosong/0
|   - bila keduanya 0/null -> exception (migration dibatalkan, tidak
|     pernah membagi dengan nol)
|
| Boundary legacy:
|   - users              : SEMUA user yang ada saat migration berjalan.
|                          Asumsi: import data panel lama SUDAH SELESAI
|                          sebelum migration ini dijalankan (di produksi
|                          maupun lokal), sehingga tidak ada lagi user
|                          baru ber-satuan rupiah setelah sistem berjalan
|                          dalam satuan kredit.
|   - orders             : HANYA baris dengan created_at < '2026-11-01'
|                          (order baru setelah go-live kredit sudah
|                          tersimpan dalam satuan kredit, contoh id 77-78).
|   - user_balance_logs  : initial_balance & final_balance dikonversi untuk
|                          SEMUA log category='order'; amount HANYA untuk
|                          log yang content_params-nya menunjuk order
|                          legacy (order_id <= order legacy terakhir),
|                          karena amount log order baru sudah kredit.
|                          Log category='deposit' tidak disentuh.
|   - service_custom_prices : kolom harga hanya bila kolom price/profit
|                          masih ada (sudah diganti price_configs JSON di
|                          skema baru) dan ada baris legacy.
|
| Idempoten: diberi penanda di tabel `configs` (key
| legacy_money_units_converted). Bila migration dijalankan ulang pada DB
| yang datanya sudah dikonversi, seluruh up() langsung selesai tanpa
| mengubah apa pun (mencegah pembagian ganda / double-conversion).
|
| Backup: SEBELUM ada perubahan, seluruh baris yang akan diubah disimpan
| sebagai JSON di direktori sementara (fallback storage/app).
*/

return new class extends Migration
{
    public function up(): void
    {
        // ------------------------------------------------------------------
        // 0. Guard idempotensi: jangan konversi dua kali.
        // ------------------------------------------------------------------
        // Nilai flag selalu JSON hasil updateOrInsert di bawah, jadi cukup
        // cek keberadaan barisnya (bukan membandingkan teks '1').
        $flagKey = 'legacy_money_units_converted';
        $alreadyConverted = DB::table('configs')->where('key', $flagKey)->first();

        if ($alreadyConverted !== null) {
            return;
        }

        // ------------------------------------------------------------------
        // 1. Ambil kurs LIVE saat migration berjalan.
        //    Kurs beli dipakai karena deposit mengkreditkan nominal rupiah
        //    dengan kurs_beli (usd_rate_buy), jadi konversi balik harus
        //    memakai kurs yang sama agar nilainya konsisten.
        // ------------------------------------------------------------------
        $locale = DB::table('locales')->where('id', 1)->first();

        if ($locale === null) {
            throw new RuntimeException('Konversi uang legacy dibatalkan: baris locales id=1 tidak ditemukan (kurs tidak diketahui).');
        }

        $kurs = (float) ($locale->usd_rate_buy ?? 0);
        $kursSource = 'usd_rate_buy';

        if ($kurs <= 0) {
            $kurs = (float) ($locale->usd_rate ?? 0);
            $kursSource = 'usd_rate';
        }

        if ($kurs <= 0) {
            throw new RuntimeException('Konversi uang legacy dibatalkan: usd_rate_buy dan usd_rate locales id=1 sama-sama 0/null (tidak boleh membagi dengan nol).');
        }

        // ------------------------------------------------------------------
        // 2. Tentukan boundary data legacy.
        // ------------------------------------------------------------------
        $orderBoundary = '2026-11-01 00:00:00';

        $legacyOrderIds = DB::table('orders')
            ->where('created_at', '<', $orderBoundary)
            ->pluck('id')
            ->all();

        // Order legacy terakhir (id paling besar). Log amount hanya
        // dikonversi bila order_id-nya <= nilai ini.
        $maxLegacyOrderId = $legacyOrderIds === [] ? 0 : max($legacyOrderIds);

        // ------------------------------------------------------------------
        // 3. Backup baris yang akan diubah (JSON) SEBELUM menyentuh data.
        // ------------------------------------------------------------------
        $users = DB::table('users')
            ->select('id', 'username', 'balance', 'commission')
            ->get()
            ->all();

        $ordersLegacy = DB::table('orders')
            ->select('id', 'user_id', 'price', 'profit', 'initial_balance', 'final_balance', 'created_at')
            ->where('created_at', '<', $orderBoundary)
            ->orderBy('id')
            ->get()
            ->all();

        $balanceLogsOrder = DB::table('user_balance_logs')
            ->select('id', 'user_id', 'type', 'category', 'amount', 'content_params', 'initial_balance', 'final_balance')
            ->where('category', 'order')
            ->orderBy('id')
            ->get()
            ->all();

        $customPricesLegacy = [];
        $scpHasPriceColumns = Schema::hasColumn('service_custom_prices', 'price')
            && Schema::hasColumn('service_custom_prices', 'profit');

        if ($scpHasPriceColumns) {
            $customPricesLegacy = DB::table('service_custom_prices')
                ->select('id', 'user_group_id', 'service_id', 'price', 'profit', 'created_at')
                ->where('created_at', '<', $orderBoundary)
                ->orderBy('id')
                ->get()
                ->all();
        }

        $backupDir = 'C:\\Users\\ThinkPad\\AppData\\Local\\Temp\\opencode';
        $backupPath = is_dir($backupDir)
            ? $backupDir.'\\backup-legacy-money.json'
            : storage_path('app/backup-legacy-money.json');

        file_put_contents($backupPath, json_encode([
            'dibuat_pada' => now()->toIso8601String(),
            'keterangan' => 'Backup sebelum konversi satuan rupiah-mentah -> kredit (nilai_kredit = ROUND(nilai / kurs, 8)).',
            'kurs_dipakai' => $kurs,
            'kurs_kolom' => $kursSource,
            'order_boundary_legacy' => $orderBoundary,
            'max_legacy_order_id' => $maxLegacyOrderId,
            'users' => $users,
            'orders_legacy' => $ordersLegacy,
            'user_balance_logs_order' => $balanceLogsOrder,
            'service_custom_prices_legacy' => $customPricesLegacy,
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

        // ------------------------------------------------------------------
        // 4. Konversi: satu UPDATE per tabel, kurs di-bind sebagai parameter.
        //    Dibungkus transaksi agar tidak ada konversi parsial.
        // ------------------------------------------------------------------
        DB::transaction(function () use ($kurs, $kursSource, $orderBoundary, $maxLegacyOrderId, $scpHasPriceColumns, $flagKey) {

            // users: SEMUA user (asumsi import selesai sebelum deploy,
            // tidak ada lagi user ber-satuan rupiah setelah go-live kredit).
            DB::update(
                'UPDATE users SET balance = ROUND(balance / ?, 8), commission = ROUND(commission / ?, 8)',
                [$kurs, $kurs]
            );

            // orders: hanya baris legacy (created_at < boundary).
            $orderColumns = 'price = ROUND(price / ?, 8), profit = ROUND(profit / ?, 8)'.
                (Schema::hasColumn('orders', 'initial_balance') ? ', initial_balance = ROUND(initial_balance / ?, 8)' : '').
                (Schema::hasColumn('orders', 'final_balance') ? ', final_balance = ROUND(final_balance / ?, 8)' : '');

            $orderBindings = Schema::hasColumn('orders', 'initial_balance')
                ? [$kurs, $kurs, $kurs, $kurs, $orderBoundary]
                : [$kurs, $kurs, $orderBoundary];

            DB::update(
                "UPDATE orders SET {$orderColumns} WHERE created_at < ?",
                $orderBindings
            );

            // user_balance_logs:
            //   a) initial_balance & final_balance untuk SEMUA log order
            //      (saldo awal/akhir transaksi legacy memang rupiah-mentah).
            //   b) amount HANYA untuk log yang menunjuk order legacy
            //      (order_id <= max legacy), karena log order baru sudah
            //      ber-satuan kredit. Log category='deposit' tidak disentuh.
            DB::update(
                "UPDATE user_balance_logs
                 SET initial_balance = ROUND(initial_balance / ?, 8),
                     final_balance = ROUND(final_balance / ?, 8)
                 WHERE category = ?",
                [$kurs, $kurs, 'order']
            );

            if ($maxLegacyOrderId > 0) {
                DB::update(
                    "UPDATE user_balance_logs
                     SET amount = ROUND(amount / ?, 8)
                     WHERE category = ?
                       AND content_params IS NOT NULL
                       AND JSON_VALID(content_params)
                       AND JSON_EXTRACT(content_params, '$.\"order_id\"') IS NOT NULL
                       AND CAST(JSON_EXTRACT(content_params, '$.\"order_id\"') AS UNSIGNED) <= ?",
                    [$kurs, 'order', $maxLegacyOrderId]
                );
            }

            // service_custom_prices: hanya bila skema masih memakai kolom
            // harga numerik (skema baru memakai price_configs JSON) dan ada
            // baris legacy.
            if ($scpHasPriceColumns) {
                DB::update(
                    'UPDATE service_custom_prices SET price = ROUND(price / ?, 8), profit = ROUND(profit / ?, 8) WHERE created_at < ?',
                    [$kurs, $kurs, $orderBoundary]
                );
            }

            // Tandai sudah dikonversi (idempoten).
            DB::table('configs')->updateOrInsert(
                ['key' => $flagKey],
                ['value' => json_encode([
                    'converted_at' => now()->toIso8601String(),
                    'kurs' => $kurs,
                    'kurs_source' => $kursSource,
                ])]
            );
        });
    }

    public function down(): void
    {
        // Konversi satuan tidak bisa dibalik tanpa mengetahui kurs yang
        // dipakai saat konversi (kurs berjalan/tidak tersimpan per baris
        // lama). Data asli tersimpan di file backup JSON yang dibuat di
        // awal up(). Migration ini sengaja no-op.
    }
};

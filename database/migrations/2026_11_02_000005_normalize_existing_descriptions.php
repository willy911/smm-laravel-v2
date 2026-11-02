<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Bersihkan deskripsi layanan yang tersimpan berformat HTML dari provider
     * (tag <br>, <p>, entity) menjadi teks polos ber-newline, agar tidak tampil
     * literal (mis. "Please Read<br />") di UI yang merender deskripsi pre-line.
     *
     * Mengenai tabel service_provider_services (sumber) dan services (turunan).
     * Idempoten: deskripsi yang sudah bersih tidak berubah.
     */
    public function up(): void
    {
        foreach (['service_provider_services', 'services'] as $table) {
            DB::table($table)
                ->whereNotNull('description')
                ->where('description', '<>', '')
                ->orderBy('id')
                ->chunkById(500, function ($rows) use ($table) {
                    foreach ($rows as $row) {
                        $normalized = $this->normalize($row->description);

                        if ($normalized !== null && $normalized !== $row->description) {
                            DB::table($table)
                                ->where('id', $row->id)
                                ->update(['description' => $normalized]);
                        }
                    }
                });
        }
    }

    public function down(): void
    {
        // Tidak bisa dikembalikan (informasi format asli hilang) — no-op.
    }

    /**
     * Normalisasi deskripsi: tag <br>/<p> -> newline, lepas tag lain,
     * decode entity umum, rapikan newline (maksimal satu baris kosong berurutan).
     * Sama aturannya dengan ProviderServicesFetcher::normalizeDescription().
     */
    protected function normalize(?string $description): ?string
    {
        if ($description === null || $description === '') {
            return $description;
        }

        $text = html_entity_decode($description, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/<br\s*\/?>\s*(?:\r\n|\r|\n)?/i', "\n", $text);
        $text = preg_replace('/<\/p\s*>|<p\b[^>]*>/i', "\n", $text);
        $text = strip_tags($text);

        $lines = preg_split('/\r\n|\r|\n/', $text);
        $lines = array_map(fn ($line) => trim($line), $lines);

        $result = [];
        $blank = 0;
        foreach ($lines as $line) {
            if ($line === '') {
                $blank++;
                if ($blank > 1) {
                    continue;
                }
                $result[] = '';
                continue;
            }
            $blank = 0;
            $result[] = $line;
        }

        $text = implode("\n", $result);
        $text = trim($text);

        return $text === '' ? $description : $text;
    }
};

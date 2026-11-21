<?php

namespace App\Services\Admin\Website;

use App\Models\Website\WebsiteNews;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class FcmPushService
{
    private const TOPIC = 'indopedia_news';

    private const CHANNEL_ID = 'orders';

    private const SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

    private const DEFAULT_TOKEN_URI = 'https://oauth2.googleapis.com/token';

    private const TOKEN_CACHE_KEY = 'fcm_oauth_token';

    /**
     * Kirim notifikasi push berita ke topik FCM aplikasi Android.
     *
     * @return array{ok: bool, body?: string, error?: string}
     */
    public static function sendNews(WebsiteNews $news): array
    {
        $path = config('app.fcm_credentials_path')
            ?: env('GOOGLE_APPLICATION_CREDENTIALS')
            ?: '/etc/indopedia/firebase-adminsdk.json';

        // Path relatif dari .env diresolve terhadap root aplikasi.
        $isAbsolute = str_starts_with($path, '/')
            || str_starts_with($path, '\\')
            || (strlen($path) >= 3 && $path[1] === ':' && ($path[2] === '/' || $path[2] === '\\'));
        if (!$isAbsolute) {
            $path = base_path($path);
        }

        if (!@is_file($path)) {
            Log::warning('FCM push gagal: file kredensial tidak ditemukan atau tidak dapat dibaca: ' . $path . ' (pastikan path berada di dalam open_basedir yang diizinkan)');

            return [
                'ok'    => false,
                'error' => 'FCM push gagal: file kredensial tidak ditemukan atau tidak dapat dibaca: ' . $path . ' (pastikan path berada di dalam open_basedir yang diizinkan)',
            ];
        }

        if (!@is_readable($path)) {
            Log::warning('FCM push gagal: file kredensial tidak ditemukan atau tidak dapat dibaca: ' . $path . ' (pastikan path berada di dalam open_basedir yang diizinkan)');

            return [
                'ok'    => false,
                'error' => 'FCM push gagal: file kredensial tidak ditemukan atau tidak dapat dibaca: ' . $path . ' (pastikan path berada di dalam open_basedir yang diizinkan)',
            ];
        }

        $credentials = json_decode((string) @file_get_contents($path), true);
        if (
            !is_array($credentials)
            || empty($credentials['client_email'])
            || empty($credentials['private_key'])
            || empty($credentials['project_id'])
        ) {
            Log::warning('FCM push gagal: kredensial Admin SDK tidak valid atau tidak lengkap.');

            return [
                'ok'    => false,
                'error' => 'Kredensial Admin SDK FCM tidak valid.',
            ];
        }

        try {
            $accessToken = self::getAccessToken($credentials);

            $title = (string) $news->title;
            $body = Str::limit(trim(preg_replace('/\s+/', ' ', strip_tags((string) $news->content))), 120);

            $payload = [
                'message' => [
                    'topic'        => self::TOPIC,
                    'notification' => [
                        'title' => $title,
                        'body'  => $body,
                    ],
                    'data' => [
                        'news_id' => (string) $news->id,
                        'slug'    => (string) $news->slug,
                        'title'   => $title,
                    ],
                    'android' => [
                        'notification' => [
                            'channel_id' => self::CHANNEL_ID,
                        ],
                    ],
                ],
            ];

            $response = Http::withToken($accessToken)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("https://fcm.googleapis.com/v1/projects/{$credentials['project_id']}/messages:send", $payload);

            if (!$response->successful()) {
                Log::warning('FCM push gagal: ' . $response->body());
            } else {
                Log::info('FCM push berita terkirim', [
                    'news_id' => $news->id,
                    'topic'   => self::TOPIC,
                    'body'    => Str::limit($response->body(), 500),
                ]);
            }

            return [
                'ok'   => $response->successful(),
                'body' => $response->body(),
            ];
        } catch (Throwable $e) {
            Log::warning('FCM push gagal: ' . $e->getMessage());

            return [
                'ok'    => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Ambil (dan cache) OAuth2 access token untuk Firebase Cloud Messaging v1.
     */
    private static function getAccessToken(array $credentials): string
    {
        return Cache::remember(self::TOKEN_CACHE_KEY, 3300, function () use ($credentials) {
            $tokenUri = $credentials['token_uri'] ?? self::DEFAULT_TOKEN_URI;
            $now = self::trustedNow() - 600; // buffer 10 menit agar iat tidak dianggap di masa depan bila jam lokal maju

            $header = self::base64UrlEncode((string) json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
            $claim = self::base64UrlEncode((string) json_encode([
                'iss'   => $credentials['client_email'],
                'scope' => self::SCOPE,
                'aud'   => $tokenUri,
                'iat'   => $now,
                'exp'   => $now + 3600,
            ]));

            $unsigned = $header . '.' . $claim;
            $signature = '';
            if (!openssl_sign($unsigned, $signature, $credentials['private_key'], OPENSSL_ALGO_SHA256)) {
                throw new RuntimeException('Gagal menandatangani JWT FCM dengan private key.');
            }
            $assertion = $unsigned . '.' . self::base64UrlEncode($signature);

            $response = Http::asForm()->post($tokenUri, [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion'  => $assertion,
            ]);

            $accessToken = $response->json('access_token');
            if (!$response->successful() || !is_string($accessToken) || $accessToken === '') {
                throw new RuntimeException('Gagal memperoleh access token FCM: ' . $response->body());
            }

            return $accessToken;
        });
    }

    /**
     * Dapatkan waktu tepercaya dari header Date HTTP Google.
     * Fallback ke waktu lokal bila sumber gagal atau hasilnya tidak wajar.
     */
    private static function trustedNow(): int
    {
        try {
            $response = Http::withOptions(['timeout' => 5])->head('https://www.google.com');
            $dateHeader = $response->header('Date');
            if (is_string($dateHeader) && $dateHeader !== '') {
                $parsed = strtotime($dateHeader);
                if ($parsed !== false && $parsed > 0 && abs($parsed - time()) < 86400) {
                    return (int) $parsed;
                }
            }
        } catch (Throwable $e) {
            // Abaikan; gunakan fallback waktu lokal.
        }

        return time();
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}

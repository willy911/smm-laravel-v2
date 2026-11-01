<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'doku' => [
        'base_url'   => env('DOKU_BASE_URL', 'https://api.doku.com'),
        'client_id'  => env('DOKU_CLIENT_ID', ''),
        'shared_key' => env('DOKU_SHARED_KEY', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cronjob BCA Mutation (stub — keputusan user 31-10-2026)
    |--------------------------------------------------------------------------
    | Isi kredensial nanti via .env saat rekening BCA siap. Controller cron
    | melewati eksekusi (200 + log) bila enabled=false atau api_key kosong.
    */
    'bca_mutation' => [
        'enabled' => env('BCA_MUTATION_ENABLED', false),
        'api_key' => env('BCA_MUTATION_API_KEY'),
        'endpoint' => env('BCA_MUTATION_ENDPOINT', 'https://mutasi.ubiem.com/api/mutasi/mutasibca'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Notif Forwarder (callback GET /callback/notif-forwarder)
    |--------------------------------------------------------------------------
    | Endpoint ini memicu kredit saldo dari notifikasi HP (DANA/OVO/GoPay).
    | WAJIB mengisi NOTIF_FORWARDER_TOKEN di .env (string acak panjang),
    | jika tidak endpoint akan selalu 404. Contoh generate:
    | php -r "echo bin2hex(random_bytes(32));"
    */
    'notif_forwarder' => [
        'token' => env('NOTIF_FORWARDER_TOKEN', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cron via HTTP (GET /cron/run/{secret})
    |--------------------------------------------------------------------------
    | Untuk hosting/panel yang cron-nya hanya bisa wget/curl (mis. aaPanel).
    | WAJIB mengisi CRON_SECRET di .env (string acak panjang), jika tidak
    | endpoint akan selalu 404. Contoh generate:
    | php -r "echo bin2hex(random_bytes(32));"
    */
    'cron' => [
        'secret' => env('CRON_SECRET', ''),
    ],
];

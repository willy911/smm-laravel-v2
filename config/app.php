<?php

return [

    'wuzzpanel_api_key' => env('WUZZPANEL_API_KEY', null),
    'wuzzpanel_panel_id' => env('WUZZPANEL_PANEL_ID', 0),
    'cdn_url' => env('VITE_CDN_BASE_URL', 'https://jhonroot.dev'),

    /*
    |--------------------------------------------------------------------------
    | Website Config
    |--------------------------------------------------------------------------
    |
    | All Website Config for Web
    |
    */

    'jhonroot' => [
        'website' => json_encode([
            'name'             => 'SMM Kita',
            'sub_name'         => 'SMM Panel Indonesia',
            'logo_lg_light'    => '',
            'logo_lg_dark'     => '',
            'logo_sm_light'    => '',
            'logo_sm_dark'     => '',
            'icon'             => '',
            'about'            => '-',
            'meta_keywords'    => '-',
            'meta_description' => '-',
            'meta_image'       => '',
            'default_news_banner' => '',
            'default_theme' => 'system',
        ]),
        'smtp' => json_encode([
            'from'       => 'testing@email.com',
            'host'       => '',
            'port'       => '2525',
            'encryption' => 'TLS',
            'username'   => '',
            'password'   => '',
        ]),
        'prefix' => json_encode([
            'admin_url'     => 'admin',
            'notif_forward' => 'notif-forwarder',
        ]),
        'third_party_plugin' => json_encode([
            'tinymce' => [
                'api_key'     => '',
            ],
            'crisp' => [
                'website_id'     => '',
            ],
            'ubiem' => [
                'api_key'     => '',
            ],
            'google' => [
                'tags'    => '',
                'token'    => '',
            ],
        ]),
        'payment_gateway' => json_encode([
            'paydisini' => [
                'api_key'     => '',
                'merchant_id' => '',
                'prefix_callback_url' => ''
            ],
            'tripay' => [
                'api_key'     => '',
                'merchant_id' => '',
                'private_key' => '',
                'prefix_callback_url' => ''
            ],
            'tokopay' => [
                'merchant_id' => '',
                'secret_key'  => '',
                'prefix_callback_url' => ''
            ],
            'duitku' => [
                'api_key'     => '',
                'merchant_id' => '',
                'prefix_callback_url' => ''
            ],
            'midtrans' => [
                'server_key'     => '',
                'prefix_callback_url' => ''
            ],
        ]),
        'api' => json_encode([
            'base_url'    => 'https://jhonroot.dev',
        ]),
        'banner' => json_encode([]),
        'social' => json_encode([
            'whatsapp'  => '',
            'instagram' => '',
            'facebook'  => '',
            'tiktok'    => '',
            'telegram'  => '',
            'email'     => '',
            'google_maps' => '',
            'whatsapp_channel'  => '',
            'telegram_channel'  => '',
        ]),
        'menu' => json_encode([
            'user' => [
                'auth' => [
                    'signup' => [
                        'enabled' => '1'
                    ],
                    'reset_password' => [
                        'enabled' => '1',
                        'method'  => 'only_email', // only_email, only_whatsapp, all
                    ],
                ],
                'account_verification' => [
                    'enabled' => '1',
                    'method'  => 'only_email', // only_email, only_whatsapp, all
                ],
                'leaderboard' => [
                    'enabled' => '1'
                ],
                'affiliate' => [
                    'enabled' => '1'
                ],
                'order' => [
                    'summary' => [
                        'enabled' => '1'
                    ]
                ]
            ],
            'guest' => [
                'dashboard' => [
                    'summary' => [
                        'enabled' => '1'
                    ]
                ]
            ]
        ]),
        'order_info' => json_encode([
            [
                'icon' => 'InformationCircleIcon',
                'title' => 'Cara Membuat Pesanan',
                'content' => '
                    <p><strong>Langkah-langkah membuat pesanan baru:</strong></p>
                    <ul>
                        <li>Pilih salah satu kategori.</li>
                        <li>Pilih layanan yang ingin dipesan.</li>
                        <li>Masukkan target pesanan sesuai dengan ketentuan yang diberikan oleh layanan tersebut.</li>
                        <li>Masukkan jumlah pesanan yang diinginkan.</li>
                        <li>Klik <strong>Buat Pesanan</strong> untuk membuat pesanan.</li>
                    </ul>
                    <p><br><strong>Ketentuan membuat pesanan baru:</strong></p>
                    <ul>
                        <li>Silahkan membuat pesanan sesuai langkah-langkah di atas.</li>
                        <li>Jangan memasukkan pesanan yang sama jika pesanan sebelumnya belum selesai. Harap menunggu hingga pesanan sebelumnya diproses dengan lengkap.</li>
                        <li>Jangan membuat pesanan yang sama di platform lain jika pesanan di Wuzz Panel belum selesai.</li>
                        <li>Jangan mengganti username atau menghapus target pesanan jika status pesanan belum berhasil diproses.</li>
                        <li>Pesanan yang sudah dibuat tidak dapat dibatalkan atau direfund secara manual, karena seluruh proses pesanan dilakukan secara otomatis oleh server.</li>
                        <li>Dengan melakukan pesanan di SMMKita, Anda dianggap telah memahami dan menyetujui <strong>Syarat & Ketentuan Layanan</strong> yang berlaku di SMMKita.</li>
                    </ul>
                '
            ],
            [
                'icon' => 'Alert02Icon',
                'title' => 'Penting',
                'content' => '
                    <p><strong>Penting untuk Pembelian Instagram Followers:</strong><br><br>
                    Instruksi berikut harus diikuti secara ketat untuk mencegah <em>Flag of Review / Spam Followers</em>.<br>
                    Berikut cara menonaktifkan <em>Flag of Review / Spam Followers</em>:</p>
                    <ul>
                        <li>Buka Pengaturan/Setting Akun.</li>
                        <li>Pilih opsi "Ikuti dan Undang Teman".</li>
                        <li>Nonaktifkan fitur "Laporkan untuk Ditinjau".</li>
                    </ul>
                    <p>Pengaturan ini harus dinonaktifkan dari profil sebelum melakukan pesanan Followers Instagram.<br><br>
                    <strong>PERINGATAN: WAJIB NONAKTIFKAN SPAM FOLLOW! JIKA STATUS PESANAN SUKSES TAPI FOLLOWERS TIDAK MASUK, KAMI TIDAK BERTANGGUNG JAWAB, DAN TIDAK ADA REFILL ATAU REFUND!</strong></p>
                '
            ]
        ]),
        'reviews' => json_encode([
            [
                'full_name' => 'Jhon',
                'job' => 'Owner',
                'reviews' => 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Corrupti ratione nemo quia dolor aspernatur rerum voluptatem impedit, temporibus iusto accusamus eius debitis, repellendus facilis laudantium veniam tempora sapiente reiciendis quaerat.'
            ]
        ]),
        'theme' => json_encode([
            'light' => [
                'primary' => 'hsl(236 73.9% 61%)',
                'ring' => 'hsl(236 73.9% 61%)',
                'sidebar-ring' => 'hsl(236 73.9% 61%)',
                // 'accent' => 'oklch(0.97 0 0)',
                // 'background' => 'oklch(1 0 0)',
                // 'foreground' => 'oklch(0.145 0 0)',
            ],
            'dark' => [
                'primary' => 'hsl(236 73.9% 61%)',
                'ring' => 'hsl(236 73.9% 61%)',
                'sidebar-ring' => 'hsl(236 73.9% 61%)',
                // 'accent' => 'oklch(0.269 0 0)',
                // 'background' => 'oklch(0.145 0 0)',
                // 'foreground' => 'oklch(0.985 0 0)',
            ]
        ]),
        'affiliate' => json_encode([
            'commission'  => '10',
            'min_withdrawal'  => '10',
        ]),
    ],

    /*
    |--------------------------------------------------------------------------
    | Application Name
    |--------------------------------------------------------------------------
    |
    | This value is the name of your application, which will be used when the
    | framework needs to place the application's name in a notification or
    | other UI elements where an application name needs to be displayed.
    |
    */

    'name' => env('APP_NAME', 'Laravel'),

    /*
    |--------------------------------------------------------------------------
    | Application Environment
    |--------------------------------------------------------------------------
    |
    | This value determines the "environment" your application is currently
    | running in. This may determine how you prefer to configure various
    | services the application utilizes. Set this in your ".env" file.
    |
    */

    'env' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Application Debug Mode
    |--------------------------------------------------------------------------
    |
    | When your application is in debug mode, detailed error messages with
    | stack traces will be shown on every error that occurs within your
    | application. If disabled, a simple generic error page is shown.
    |
    */

    'debug' => (bool) env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Application URL
    |--------------------------------------------------------------------------
    |
    | This URL is used by the console to properly generate URLs when using
    | the Artisan command line tool. You should set this to the root of
    | the application so that it's available within Artisan commands.
    |
    */

    'url' => env('APP_URL', 'http://localhost'),

    /*
    |--------------------------------------------------------------------------
    | Application Timezone
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default timezone for your application, which
    | will be used by the PHP date and date-time functions. The timezone
    | is set to "UTC" by default as it is suitable for most use cases.
    |
    */

    'timezone' => env('APP_TIMEZONE', 'Asia/Jakarta'),

    /*
    |--------------------------------------------------------------------------
    | Application Locale Configuration
    |--------------------------------------------------------------------------
    |
    | The application locale determines the default locale that will be used
    | by Laravel's translation / localization methods. This option can be
    | set to any locale for which you plan to have translation strings.
    |
    */

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Encryption Key
    |--------------------------------------------------------------------------
    |
    | This key is utilized by Laravel's encryption services and should be set
    | to a random, 32 character string to ensure that all encrypted values
    | are secure. You should do this prior to deploying the application.
    |
    */

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Maintenance Mode Driver
    |--------------------------------------------------------------------------
    |
    | These configuration options determine the driver used to determine and
    | manage Laravel's "maintenance mode" status. The "cache" driver will
    | allow maintenance mode to be controlled across multiple machines.
    |
    | Supported drivers: "file", "cache"
    |
    */

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

];

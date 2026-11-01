<?php

return [
    'email_verification' => [
        'title' => 'Verifikasi Email',
        'check_email' => 'Silakan periksa email Anda di <b>:email</b> untuk memverifikasi akun Anda.',
        'resend_in_seconds' => 'Kirim ulang dalam :seconds',
        'button' => 'Kirim Ulang Email Verifikasi',
        'toast' => [
            'email_verified_successful' => 'Email berhasil diverifikasi.',
            'email_resent_successful' => 'Email verifikasi berhasil dikirim ulang.',
        ],
        'log' => [
            'email_verified_successful'     => 'Melakukan verifikasi email.',
        ],
    ],
    'settings' => [
        'update_profile_button' => 'Perbarui Profil',
        'update_api_button' => 'Perbarui API',

        'toast' => [
            'update_profile_successful' => 'Profil berhasil diperbarui.',
            'update_api_successful' => 'API berhasil diperbarui.',
            'update_notification_successful' => 'Notifikasi berhasil diperbarui.',
        ],

        'log' => [
            'update_api_successful'            => 'Memperbarui data API.',
            'update_profile_successful'        => 'Memperbarui profil akun.',
        ],
    ],
];

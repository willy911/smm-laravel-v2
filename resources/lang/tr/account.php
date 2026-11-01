<?php

return [
    'email_verification' => [
        'title' => 'E-posta Doğrulaması',
        'check_email' => 'Hesabınızı doğrulamak için lütfen <b>:email</b> adresine gönderilen e-postayı kontrol edin.',
        'resend_in_seconds' => ':seconds saniye içinde tekrar gönder',
        'button' => 'Doğrulama E-postasını Yeniden Gönder',
        'toast' => [
            'email_verified_successful' => 'E-posta başarıyla doğrulandı.',
            'email_resent_successful' => 'Doğrulama e-postası başarıyla yeniden gönderildi.',
        ],
        'log' => [
            'email_verified_successful' => 'E-posta doğrulaması yapılıyor.',
        ],
    ],
    'settings' => [
        'update_profile_button' => 'Profili Güncelle',
        'update_api_button' => 'API\'yi Güncelle',

        'toast' => [
            'update_profile_successful' => 'Profil başarıyla güncellendi.',
            'update_api_successful' => 'API başarıyla güncellendi.',
            'update_notification_successful' => 'Bildirim başarıyla güncellendi.',
        ],

        'log' => [
            'update_api_successful' => 'API verileri güncelleniyor.',
            'update_profile_successful' => 'Hesap profili güncelleniyor.',
        ],
    ],
];

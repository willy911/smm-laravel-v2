<?php

return [
    'signin' => [
        'header' => 'Tekrar hoş geldiniz!',
        'description' => 'Kaydettiğiniz hesap ile giriş yapın.',
        'button' => 'Giriş Yap',
        'cta' => [
            'signup_prefix' => 'Hesabınız yok mu?',
            'signup_link' => 'Şimdi Kaydolun',
            'forgot_password_link' => 'Şifrenizi mi Unuttunuz?',
        ],
    ],

    'signup' => [
        'header' => 'Bizim bir parçamız olun!',
        'description' => 'Hemen kaydolun ve en iyi hizmetlerin tadını çıkarın!',
        'button' => 'Şimdi Kaydolun',
        'cta' => [
            'signin_prefix' => 'Zaten bir hesabınız var mı?',
            'signin_link' => 'Giriş Yap',
            'agreement_prefix' => 'Kaydolarak ',
            'agreement_link' => 'Hizmet Şartları ve Koşulları',
            'agreement_suffix' => ' anlaşmamızı kabul etmiş olursunuz.',
            'agreement_button' => 'Tamam, Kabul Ediyorum',
        ],
    ],

    'forgot_password' => [
        'header' => 'Şifrenizi mi Unuttunuz?',
        'description' => 'Devam etmek için e-postanızı girin.',
        'button' => 'Sıfırla',
        'cta' => [
            'signin_prefix' => 'Şifrenizi hatırladınız mı?',
            'signin_link' => 'Giriş Yap',
        ],
    ],

    'reset_password' => [
        'header' => 'Şifreyi Sıfırla',
        'description' => 'Hesabınızı kurtarın.',
        'button' => 'Sıfırla',
    ],

    'toast' => [
        'goodbye' => 'Tekrar görüşmek üzere...',
        'must_signin_first' => 'Lütfen önce giriş yapın.',
        'account_deactivated' => 'Hesabınız devre dışı bırakıldı.',
        'already_registered' => 'Daha önce bir hesap kaydettiniz.',
        'signup_successful' => 'Kayıt başarılı, lütfen giriş yapın.',
        'reset_email_sent' => 'Lütfen e-postanızı kontrol edin. Şifrenizi sıfırlamak için bir e-posta gönderdik.',
        'user_not_found' => 'Kullanıcı bulunamadı.',
        'update_password' => 'Şifreniz başarıyla güncellendi.',
        'failed' => 'Bu kimlik bilgileri kayıtlarımızla eşleşmiyor.',
        'throttle' => 'Çok fazla giriş denemesi. Lütfen :seconds saniye sonra tekrar deneyin.',
    ],

    'log' => [
        'signup_successful' => 'Başarılı kayıt.',
        'signin_to_dashboard' => 'Kontrol Paneline giriş yapıldı.',
        'signout_from_dashboard' => 'Kontrol Panelinden çıkış yapıldı.',
        'update_password' => 'Şifre değişikliği yapıldı.',
    ],
];

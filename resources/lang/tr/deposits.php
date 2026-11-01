<?php

return [

    'create' => [
        'button' => 'Para Yatır!',
        'steps' => [
            'select_payment_method' => 'Ödeme Seç',
            'enter_amount' => 'Yatırılacak Miktarı Girin',
            'enter_e_wallet_number' => 'E-Cüzdan No. Girin',
        ],
    ],

    'detail' => [
        'button' => 'Para Yatırma İşlemini İptal Et!',
        'cancel_dialog' => [
            'title' => 'Gerçekten emin misiniz?',
            'description' => '<strong>:deposit_id</strong> ID\'li Para Yatırma İşlemini İptal Et.',
            'cancel_button' => 'İptal',
            'confirm_button' => 'Evet, İptal Et!',
        ]
    ],

    'labels' => [
        'complete_payment' => 'Lütfen ödemeyi tamamlayın.',
        'deposit_amount' => 'Yatırılan Miktar',
        'total_balance' => 'Toplam Bakiye',
        'total_payment' => 'Toplam Ödeme',
        'e_wallet_number' => 'E-Cüzdan No.',
        'unique_code' => 'Benzersiz Kod',
        'payment_status' => 'Ödeme Durumu',
        'expires_in' => 'Kalan Süre',
        'expires_text' => ':hours saat, :minutes dakika, :seconds saniye kaldı',
        'virtual_account_number' => 'Sanal Hesap No.',
        'payment_code' => 'Ödeme Kodu',
        'payment_target' => 'Ödeme Hedefi',
        'payment_link' => 'Ödeme Bağlantısı',
        'qr_code' => 'QR Kod',
    ],

    'toast' => [
        'unpaid_payment' => 'Lütfen önceki para yatırma işleminiz için ödemenizi yapın.',
        'payment_not_available' => 'Ödeme Yöntemi şu anda kullanılamıyor. Lütfen başka bir yöntem kullanın.',
        'create_successful' => 'Lütfen ödemenizi yapın.',
        'cancel_successful' => '<b>:deposit_id</b> ID\'li Para Yatırma İşlemi başarıyla iptal edildi.',
    ],

    'log' => [
        'process_successful' => 'Kimliği <b>:deposit_id</b> olan para yatırma işlemi başarıyla işlendi.',
        'create_successful' => '<b>:deposit_id</b> ID\'li para yatırma işlemi oluşturuluyor.',
        'cancel_successful' => '<b>:deposit_id</b> ID\'li para yatırma işlemi iptal ediliyor.',
        'balance_transfer' => 'Yöneticiden bakiye transferi.',
    ],

    'dialog' => [
        'cancel' => [
            'title' => 'Gerçekten emin misiniz?',
            'description' => ':item <b>:value</b> İptal Et.',
            'cancel_button' => 'İptal',
            'confirm_button' => 'Evet, Devam Et!',
        ],
        'approve' => [
            'title' => 'Bundan tamamen emin misiniz?',
            'description' => ':item <b>:value</b> onaylansın.',
            'cancel_button' => 'İptal',
            'confirm_button' => 'Evet, devam et!',
        ],
    ]
];

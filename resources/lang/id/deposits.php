<?php

return [

    'create' => [
        'button' => 'Buat Deposit!',
        'steps' => [
            'select_payment_method' => 'Pilih Pembayaran',
            'enter_amount'   => 'Masukkan Jumlah Deposit',
            'enter_e_wallet_number' => 'Masukkan No. E-Wallet',
        ],
    ],

    'detail' => [
        'button' => 'Batalkan Deposit!',
        'cancel_dialog' => [
            'title' => 'Apakah Anda benar-benar yakin?',
            'description' => 'Batalkan Deposit dengan ID <strong>:deposit_id</strong>.',
            'cancel_button' => 'Batalkan',
            'confirm_button' => 'Ya, Batalkan!',
        ]
    ],

    'labels' => [
        'complete_payment' => 'Harap selesaikan pembayaran.',
        'deposit_amount' => 'Jumlah Deposit',
        'total_balance'  => 'Total Saldo',
        'total_payment'  => 'Total Pembayaran',
        'e_wallet_number' => 'No. E-Wallet',
        'unique_code'             => 'Kode Unik',
        'payment_status'          => 'Status Pembayaran',
        'expires_in'              => 'Kadaluwarsa Dalam',
        'expires_text'  => ':hours jam, :minutes menit, :seconds detik tersisa',
        'virtual_account_number' => 'No. Virtual Account',
        'payment_code' => 'Kode Pembayaran',
        'payment_target' => 'Target Pembayaran',
        'payment_link' => 'Link Pembayaran',
        'qr_code' => 'Kode QR',
    ],

    'toast' => [
        'unpaid_payment'       => 'Silahkan lunasi pembayaran anda pada deposit sebelumnya.',
        'payment_not_available' => 'Metode Pembayaran sedang tidak dapat digunakan. Silahkan gunakan metode lain.',
        'create_successful'    => 'Silahkan lunasi pembayaran anda.',
        'cancel_successful'    => 'Deposit dengan ID <b>:deposit_id</b> berhasil dibatalkan.',
    ],

    'log' => [
        'process_successful'   => 'Deposit dengan ID <b>:deposit_id</b> berhasil diproses.',
        'create_successful'    => 'Membuat deposit dengan ID <b>:deposit_id</b>.',
        'cancel_successful'    => 'Membatalkan deposit dengan ID <b>:deposit_id</b>.',
        'balance_transfer'     => 'Transfer saldo dari admin.',
    ],

    'dialog' => [
        'cancel' => [
            'title' => 'Apakah Anda benar-benar yakin?',
            'description' => 'Batalkan :item <b>:value</b>.',
            'cancel_button' => 'Batalkan',
            'confirm_button' => 'Ya, Lanjutkan!',
        ],
        'approve' => [
            'title' => 'Apakah Anda benar-benar yakin?',
            'description' => 'Setujui :item <b>:value</b>.',
            'cancel_button' => 'Batalkan',
            'confirm_button' => 'Ya, Lanjutkan!',
        ],
    ]
];

<?php

return [
    'create' => [
        'button' => 'Buat Pesanan!',
    ],

    'labels' => [
        'average_time_and_quantity' => '<span class="font-medium text-green-600">:time</span> dengan jumlah rata-rata pesanan <span class="font-medium text-green-600">:quantity</span>',
        'view_order_target_example' => 'Lihat Contoh Target Pesanan',
        'order_target_example' => 'Contoh Target Pesanan',
    ],

    'toast' => [
        'refill_successful'    => 'Permintaan isi ulang pesanan berhasil dibuat.',
        'cancel_successful'    => 'Permintaan pembatalan pesanan berhasil dibuat.',
        'cancel_failed'        => 'Permintaan pembatalan pesanan ID :order_id gagal diproses oleh provider. Coba lagi nanti atau hubungi admin.',
        'refill_failed'        => 'Permintaan isi ulang pesanan ID :order_id gagal diproses oleh provider. Coba lagi nanti atau hubungi admin.',
        'invalid_order_id'     => 'ID Pesanan tidak valid.',
        'wait_previous_order' => 'Silahkan tunggu pesanan sebelumnya diproses terlebih dahulu.',
        'min_quantity' => 'Jumlah minimal adalah :min.',
        'max_quantity' => 'Jumlah maksimal adalah :max.',
        'mass_order_not_supported' => 'Layanan ini tidak mendukung pesanan massal.',
        'order_created_with_target' => 'Pesanan dengan ID <strong>:order_id</strong> = Target <strong>:order_target</strong> berhasil dibuat.',
        'service_not_available'     => 'Layanan tidak tersedia.',
        'order_created' => 'Pesanan berhasil dibuat.',
        'insufficient_balance' => 'Saldo anda tidak mencukupi, Deposit Sekarang!',
        'review_successful' => 'Ulasan berhasil dikirim. Ulasan akan tampil setelah ditinjau admin.',
        'already_reviewed' => 'Anda sudah memberikan ulasan untuk layanan ini.',
    ],

    'log' => [
        'create_successful'         => 'Membuat Pesanan dengan ID <b>:order_id</b>.',
        'create_api_successful'     => 'Membuat Pesanan (API) dengan ID <b>:order_id</b>.',
        'create_single_successful'  => 'Membuat Pesanan (Web - Tunggal) dengan ID <b>:order_id</b>.',
        'create_mass_successful'    => 'Membuat Pesanan (Web - Massal) dengan ID <b>:order_id</b>.',
        'refill_successful' => 'Membuat Isi Ulang Pesanan dengan ID <b>:order_refill_id</b>.',
        'cancel_successful'     => 'Membuat Pembatalan Pesanan dengan ID <b>:order_cancel_id</b>.',
        'refund_successful'     => 'Pengembalian dana Pesanan dengan ID <b>:order_id</b>.',
        'review_successful'     => 'Memberikan ulasan untuk pesanan dengan ID <b>:order_id</b>.',
    ],
];

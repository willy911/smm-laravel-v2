<?php

return [
    'description' => [
        'paragraph_1' => 'API (Application Programming Interface) adalah sekumpulan perintah, fungsi, dan protokol yang dapat digunakan oleh programmer saat membangun perangkat lunak, sehingga tercipta interkoneksi yang stabil dan cepat antar sistem.',
        'paragraph_2' => 'API ini adalah jalur yang dapat digunakan oleh mitra maupun host untuk berinteraksi antar program. API dapat digunakan untuk melakukan permintaan seperti cek saldo akun, cek harga layanan, cek status transaksi, dan membuat transaksi baru.',
        'paragraph_3' => 'Koneksi API ini memerlukan pengetahuan dasar tentang pemrograman komputer. Jika Anda tidak memahami dokumentasi yang kami sediakan, silahkan hubungi kami.',
        'paragraph_4' => 'Adapun beberapa hal yang perlu diperhatikan untuk koneksi API, antara lain:',
        'bullet_1' => 'Kami membungkus semua HTTP Response dalam format <strong>JSON</strong>.',
        'bullet_2' => 'Seluruh HTTP Request dikirim sebagai <strong>POST</strong> Request.',
        'bullet_3' => 'Silahkan Whitelist IP di pengaturan akun Anda.',
    ],
    'labels' => [
        'preparation' => 'Persiapan',
        'profile' => 'Profil',
        'services' => 'Daftar Layanan',
        'create_order' => 'Buat Pesanan',
        'status_order' => 'Status Pesanan',
        'create_order_refill' => 'Buat Isi Ulang Pesanan',
        'status_order_refill' => 'Status Isi Ulang Pesanan',
        'create_order_cancel' => 'Pembatalan Pesanan',
        'endpoint' => 'Endpoint',
        'body_request' => 'Body Request',
        'example_request' => 'Example Request',
        'example_response' => 'Example Response',
        'parameter' => 'Parameter',
        'type'      => 'Tipe Data',
        'required'  => 'Wajib',
        'description' => 'Deskripsi',
        'success' => 'Sukses',
        'fail' => 'Gagal',
    ],
    'fields' => [
        'api_key' => [
            'required' => 'Ya',
            'description' => 'API Key yang telah diatur di pengaturan API',
        ],
        'secret_key' => [
            'required' => 'Ya',
            'description' => 'Secret Key yang telah diatur di pengaturan API',
        ],
        'is_favorites' => [
            'required' => 'Tidak',
            'description' => 'Isi dengan <code class="bg-muted rounded px-1 py-0.5 text-destructive">true</code> untuk menampilkan layanan favorit',
        ],
        'id' => [
            'required' => 'Ya',
            'description' => 'ID pesanan, pisahkan dengan tanda koma (,) untuk pengecekan secara massal',
        ],
        'order_id' => [
            'required' => 'Ya',
            'description' => 'ID pesanan',
        ],
        'order_refill_id' => [
            'required' => 'Ya',
            'description' => 'ID isi ulang pesanan',
        ],
        'service_id' => [
            'required' => 'Ya',
            'description' => 'ID Layanan, lihat selengkapnya',
        ],
        'target' => [
            'required' => 'Ya',
            'description' => 'Target pesanan, berupa username/link/lainnya',
        ],
        'quantity' => [
            'required' => 'Ya',
            'description' => 'Jumlah pesanan',
        ],
        'usernames' => [
            'required' => 'Ya',
            'description' => 'Daftar username dipisahkan oleh <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> atau <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtags' => [
            'required' => 'Ya',
            'description' => 'Daftar hashtag dipisahkan oleh <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> atau <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtag' => [
            'required' => 'Ya',
            'description' => 'Hashtag untuk menangkap/mencari username',
        ],
        'username' => [
            'required' => 'Ya',
            'description' => 'Username pemilik komentar',
        ],
        'media' => [
            'required' => 'Ya',
            'description' => 'URL Media untuk menangkap/mencari daftar penyuka',
        ],
        'answer_number' => [
            'required' => 'Ya',
            'description' => 'Nomor jawaban dari daftar pilihan',
        ],
        'comments' => [
            'required' => 'Ya',
            'description' => 'Daftar komentar dipisahkan oleh <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> atau <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
    ],
    'responses' => [
        'total_order_count'   => 'Total jumlah pesanan',
        'total_deposit_count' => 'Total jumlah deposit',
        'api_key_required'     => 'api_key wajib diisi.',
        'secret_key_required'  => 'secret_key wajib diisi.',
        'ip_not_whitelisted'   => 'IP Anda :ip tidak terdaftar dalam Whitelist IP.',
        'service_id_required'       => 'service_id wajib diisi.',
        'service_id_numeric'        => 'service_id harus berupa angka.',
        'service_id_invalid'        => 'service_id yang dipilih tidak valid.',
        'quantity_numeric'          => 'quantity harus berupa angka.',
        'quantity_min'              => 'quantity minimal bernilai :min.',
        'insufficient_balance'      => 'Saldo anda tidak mencukupi.',
        'service_not_available'     => 'Layanan tidak tersedia.',
        'no_data_found'  => 'tidak ada pesanan ditemukan.',
        'data_found'  => 'pesanan ditemukan.',
        'id_invalid' => 'id yang dipilih tidak valid.',
        'order_cannot_be_refilled' => 'pesanan tidak dapat diisi ulang.',
    ],
];

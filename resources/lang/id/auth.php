<?php

return [
    'signin' => [
        'header' => 'Selamat datang kembali!',
        'description' => 'Masuk dengan akun yang telah Anda daftarkan.',
        'button' => 'Masuk',
        'cta' => [
            'signup_prefix' => 'Belum memiliki akun?',
            'signup_link' => 'Daftar Sekarang',
            'forgot_password_link' => 'Lupa Kata Sandi?',
        ],
    ],

    'signup' => [
        'header' => 'Jadi bagian dari kami!',
        'description' => 'Daftar sekarang dan nikmati layanan terbaik!',
        'button' => 'Daftar Sekarang',
        'cta' => [
            'signin_prefix' => 'Sudah memiliki akun?',
            'signin_link' => 'Masuk',
            'agreement_prefix' => 'Dengan mendaftar, Anda telah menyetujui ',
            'agreement_link' => 'Syarat & Ketentuan Layanan',
            'agreement_suffix' => ' kami.',
            'agreement_button' => 'Baik, Saya Setuju',
        ],
    ],

    'forgot_password' => [
        'header' => 'Lupa Kata Sandi?',
        'description' => 'Masukkan emailmu untuk melanjutkan.',
        'button' => 'Atur Ulang',
        'cta' => [
            'signin_prefix' => 'Sudah mengingat kata sandi?',
            'signin_link' => 'Masuk',
        ],
    ],

    'reset_password' => [
        'header' => 'Atur Ulang Kata Sandi',
        'description' => 'Pulihkan akun anda.',
        'button' => 'Atur Ulang',
    ],

    'toast' => [
        'goodbye'         => 'Sampai jumpa lagi...',
        'must_signin_first' => 'Silahkan masuk terlebih dahulu.',
        'account_deactivated' => 'Akun anda dinonaktifkan.',
        'already_registered' => 'Anda telah mendaftarkan akun sebelumnya.',
        'signup_successful' => 'Pendaftaran berhasil, silahkan masuk.',
        'reset_email_sent'  => 'Silahkan periksa email anda. Kami telah mengirimkan email untuk mengatur ulang kata sandi anda.',
        'user_not_found'        => 'Pengguna tidak ditemukan.',
        'update_password'      => 'Kata sandi Anda berhasil diperbarui.',
        'failed'  => 'Identitas tersebut tidak cocok dengan data kami.',
        'throttle' => 'Terlalu banyak usaha masuk. Silahkan coba lagi dalam :seconds detik.',
    ],

    'log' => [
        'signup_successful' => 'Pendaftaran berhasil.',
        'signin_to_dashboard'   => 'Masuk ke Dasbor.',
        'signout_from_dashboard' => 'Keluar dari Dasbor.',
        'update_password'   => 'Melakukan perubahan Kata Sandi.',
    ],
];

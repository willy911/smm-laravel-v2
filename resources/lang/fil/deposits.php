<?php

return [

    'create' => [
        'button' => 'Gumawa ng Deposit!',
        'steps' => [
            'select_payment_method' => 'Pumili ng Paraan ng Pagbabayad',
            'enter_amount'   => 'Ilagay ang Halaga ng Deposit',
            'enter_e_wallet_number' => 'Ilagay ang E-Wallet Number',
        ],
    ],

    'detail' => [
        'button' => 'Kanselahin ang Deposit!',
        'cancel_dialog' => [
            'title' => 'Sigurado ka ba?',
            'description' => 'Kanselahin ang Deposit na may ID <strong>:deposit_id</strong>.',
            'cancel_button' => 'Kanselahin',
            'confirm_button' => 'Oo, Kanselahin!',
        ]
    ],

    'labels' => [
        'complete_payment' => 'Mangyaring kumpletuhin ang pagbabayad.',
        'deposit_amount' => 'Halaga ng Deposit',
        'total_balance'  => 'Kabuuang Balanse',
        'total_payment'  => 'Kabuuang Bayad',
        'e_wallet_number' => 'E-Wallet Number',
        'unique_code'             => 'Natatanging Code',
        'payment_status'          => 'Status ng Pagbabayad',
        'expires_in'              => 'Mag-e-expire Sa',
        'expires_text'  => 'Natitirang :hours oras, :minutes minuto, :seconds segundo',
        'virtual_account_number' => 'Virtual Account Number',
        'payment_code' => 'Payment Code',
        'payment_target' => 'Target ng Pagbabayad',
        'payment_link' => 'Payment Link',
        'qr_code' => 'QR Code',
    ],

    'toast' => [
        'unpaid_payment'       => 'Mangyaring bayaran muna ang iyong nakaraang deposit.',
        'payment_not_available' => 'Ang paraan ng pagbabayad ay kasalukuyang hindi magagamit. Mangyaring gumamit ng ibang paraan.',
        'create_successful'    => 'Mangyaring kumpletuhin ang iyong pagbabayad.',
        'cancel_successful'    => 'Ang Deposit na may ID <b>:deposit_id</b> ay matagumpay na nakansela.',
    ],

    'log' => [
        'process_successful'   => 'Ang Deposit na may ID <b>:deposit_id</b> ay matagumpay na naproseso.',
        'create_successful'    => 'Gumawa ng deposit na may ID <b>:deposit_id</b>.',
        'cancel_successful'    => 'Kinansela ang deposit na may ID <b>:deposit_id</b>.',
        'balance_transfer'     => 'Paglipat ng balanse mula sa admin.',
    ],

    'dialog' => [
        'cancel' => [
            'title' => 'Sigurado ka ba?',
            'description' => 'Kanselahin ang :item <b>:value</b>.',
            'cancel_button' => 'Kanselahin',
            'confirm_button' => 'Oo, Magpatuloy!',
        ],
        'approve' => [
            'title' => 'Sigurado ka ba?',
            'description' => 'Aprubahan ang :item <b>:value</b>.',
            'cancel_button' => 'Kanselahin',
            'confirm_button' => 'Oo, Magpatuloy!',
        ],
    ]
];

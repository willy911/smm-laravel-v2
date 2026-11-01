<?php

return [

    'create' => [
        'button' => 'Create Deposit!',
        'steps' => [
            'select_payment_method' => 'Select Payment',
            'enter_amount' => 'Enter Deposit Amount',
            'enter_e_wallet_number' => 'Enter E-Wallet Number',
        ],
    ],

    'detail' => [
        'button' => 'Cancel Deposit!',
        'cancel_dialog' => [
            'title' => 'Are you absolutely sure?',
            'description' => 'Cancel Deposit with ID <strong>:deposit_id</strong>.',
            'cancel_button' => 'Cancel',
            'confirm_button' => 'Yes, Cancel!',
        ]
    ],

    'labels' => [
        'complete_payment' => 'Please complete the payment.',
        'deposit_amount' => 'Deposit Amount',
        'total_balance' => 'Total Balance',
        'total_payment' => 'Total Payment',
        'e_wallet_number' => 'E-Wallet Number',
        'unique_code' => 'Unique Code',
        'payment_status' => 'Payment Status',
        'expires_in' => 'Expires In',
        'expires_text' => ':hours hours, :minutes minutes, :seconds seconds remaining',
        'virtual_account_number' => 'Virtual Account Number',
        'payment_code' => 'Payment Code',
        'payment_target' => 'Payment Target',
        'payment_link' => 'Payment Link',
        'qr_code' => 'QR Code',
    ],

    'toast' => [
        'unpaid_payment' => 'Please settle your payment for the previous deposit.',
        'payment_not_available' => 'Payment method is currently unavailable. Please use another method.',
        'create_successful' => 'Please settle your payment.',
        'cancel_successful' => 'Deposit with ID <b>:deposit_id</b> successfully cancelled.',
    ],

    'log' => [
        'process_successful' => 'Deposit with ID <b>:deposit_id</b> has been successfully processed.',
        'create_successful' => 'Created deposit with ID <b>:deposit_id</b>.',
        'cancel_successful' => 'Cancelled deposit with ID <b>:deposit_id</b>.',
        'balance_transfer' => 'Balance transfer from admin.',
    ],

    'dialog' => [
        'cancel' => [
            'title' => 'Are you absolutely sure?',
            'description' => 'Cancel :item <b>:value</b>.',
            'cancel_button' => 'Cancel',
            'confirm_button' => 'Yes, Continue!',
        ],
        'approve' => [
            'title' => 'Are you absolutely sure?',
            'description' => 'Approve :item <b>:value</b>.',
            'cancel_button' => 'Cancel',
            'confirm_button' => 'Yes, Continue!',
        ],
    ]
];

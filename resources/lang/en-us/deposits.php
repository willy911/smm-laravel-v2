<?php

return [
    'title' => 'Deposits',

    'create' => [
        'title' => 'Create',
        'button' => 'Create Deposit!',
        'steps' => [
            'select_payment_method' => 'Select Payment Method',
            'enter_amount' => 'Enter Deposit Amount',
            'enter_e_wallet_number' => 'Enter E-Wallet Number',
        ],
    ],

    'detail' => [
        'title' => 'Please complete the payment.',
        'button' => 'Cancel Deposit!',
        'cancel_dialog' => [
            'title' => 'Are you sure?',
            'description' => 'Cancel Deposit with ID <strong>:deposit_id</strong>.',
            'cancel_button' => 'Cancel',
            'confirm_button' => 'Yes, Cancel!',
        ],
    ],

    'list' => [
        'title' => 'List',
    ],

    'labels' => [
        'payment_method' => 'Payment Method',
        'minimum' => 'Minimum',
        'maximum' => 'Maximum',
        'bonus' => 'Bonus',
        'admin_fee' => 'Service Fee',
        'no_admin_fee' => 'No Service Fee',
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
        'unpaid_payment' => 'Please complete payment on your previous deposit.',
        'payment_not_available' => 'The selected payment method is currently unavailable. Please use an alternative method.',
        'create_successful' => 'Deposit created. Please complete the payment.',
        'cancel_successful' => 'Deposit <b>:deposit_id</b> canceled successfully.',
    ],

    'log' => [
        'create_successful' => 'Created deposit with ID <b>:deposit_id</b>.',
        'cancel_successful' => 'Canceled deposit with ID <b>:deposit_id</b>.',
        'balance_transfer' => 'Balance transfer from admin.',
    ],
];

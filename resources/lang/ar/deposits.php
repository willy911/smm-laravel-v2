<?php

return [

    'create' => [
        'button' => 'إنشاء إيداع!',
        'steps' => [
            'select_payment_method' => 'اختر طريقة الدفع',
            'enter_amount'   => 'أدخل مبلغ الإيداع',
            'enter_e_wallet_number' => 'أدخل رقم المحفظة الإلكترونية',
        ],
    ],

    'detail' => [
        'button' => 'إلغاء الإيداع!',
        'cancel_dialog' => [
            'title' => 'هل أنت متأكد تماماً؟',
            'description' => 'إلغاء الإيداع برقم <strong>:deposit_id</strong>.',
            'cancel_button' => 'إلغاء',
            'confirm_button' => 'نعم، إلغاء!',
        ]
    ],

    'labels' => [
        'complete_payment' => 'يرجى إتمام الدفع.',
        'deposit_amount' => 'مبلغ الإيداع',
        'total_balance'  => 'إجمالي الرصيد',
        'total_payment'  => 'إجمالي الدفع',
        'e_wallet_number' => 'رقم المحفظة الإلكترونية',
        'unique_code'             => 'الرمز الفريد',
        'payment_status'          => 'حالة الدفع',
        'expires_in'              => 'ينتهي خلال',
        'expires_text'  => 'متبقي :hours ساعة، :minutes دقيقة، :seconds ثانية',
        'virtual_account_number' => 'رقم الحساب الافتراضي',
        'payment_code' => 'رمز الدفع',
        'payment_target' => 'هدف الدفع',
        'payment_link' => 'رابط الدفع',
        'qr_code' => 'رمز QR',
    ],

    'toast' => [
        'unpaid_payment'       => 'يرجى سداد دفعتك على الإيداع السابق.',
        'payment_not_available' => 'طريقة الدفع غير متاحة حالياً. يرجى استخدام طريقة أخرى.',
        'create_successful'    => 'يرجى سداد دفعتك.',
        'cancel_successful'    => 'تم إلغاء الإيداع برقم <b>:deposit_id</b> بنجاح.',
    ],

    'log' => [
        'process_successful' => 'تمت معالجة الإيداع ذو المعرف <b>:deposit_id</b> بنجاح.',
        'create_successful'    => 'إنشاء إيداع برقم <b>:deposit_id</b>.',
        'cancel_successful'    => 'إلغاء الإيداع برقم <b>:deposit_id</b>.',
        'balance_transfer'     => 'تحويل الرصيد من المسؤول.',
    ],

    'dialog' => [
        'cancel' => [
            'title' => 'هل أنت متأكد تماماً؟',
            'description' => 'إلغاء :item <b>:value</b>.',
            'cancel_button' => 'إلغاء',
            'confirm_button' => 'نعم، متابعة!',
        ],
        'approve' => [
            'title' => 'هل أنت متأكد تمامًا؟',
            'description' => 'الموافقة على :item <b>:value</b>.',
            'cancel_button' => 'إلغاء',
            'confirm_button' => 'نعم، تابع!',
        ],
    ]
];

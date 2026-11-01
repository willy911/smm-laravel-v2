<?php

return [

    'create' => [
        'button' => 'जमा करें!',
        'steps' => [
            'select_payment_method' => 'भुगतान चुनें',
            'enter_amount' => 'जमा राशि दर्ज करें',
            'enter_e_wallet_number' => 'ई-वॉलेट नंबर दर्ज करें',
        ],
    ],

    'detail' => [
        'button' => 'जमा रद्द करें!',
        'cancel_dialog' => [
            'title' => 'क्या आप वाकई निश्चित हैं?',
            'description' => 'ID <strong>:deposit_id</strong> के साथ जमा रद्द करें।',
            'cancel_button' => 'रद्द करें',
            'confirm_button' => 'हाँ, रद्द करें!',
        ]
    ],

    'labels' => [
        'complete_payment' => 'कृपया भुगतान पूरा करें।',
        'deposit_amount' => 'जमा राशि',
        'total_balance' => 'कुल शेष राशि',
        'total_payment' => 'कुल भुगतान',
        'e_wallet_number' => 'ई-वॉलेट नंबर',
        'unique_code' => 'अद्वितीय कोड',
        'payment_status' => 'भुगतान की स्थिति',
        'expires_in' => 'समाप्त होगा',
        'expires_text' => ':hours घंटे, :minutes मिनट, :seconds सेकंड शेष',
        'virtual_account_number' => 'वर्चुअल खाता संख्या',
        'payment_code' => 'भुगतान कोड',
        'payment_target' => 'भुगतान लक्ष्य',
        'payment_link' => 'भुगतान लिंक',
        'qr_code' => 'क्यूआर कोड',
    ],

    'toast' => [
        'unpaid_payment' => 'कृपया पिछली जमा राशि पर अपना भुगतान पूरा करें।',
        'payment_not_available' => 'भुगतान विधि उपयोग के लिए उपलब्ध नहीं है। कृपया कोई अन्य विधि उपयोग करें।',
        'create_successful' => 'कृपया अपना भुगतान पूरा करें।',
        'cancel_successful' => 'ID <b>:deposit_id</b> के साथ जमा सफलतापूर्वक रद्द कर दी गई।',
    ],

    'log' => [
        'process_successful' => 'आईडी <b>:deposit_id</b> वाला जमा सफलतापूर्वक संसाधित किया गया है.',
        'create_successful' => 'ID <b>:deposit_id</b> के साथ जमा बनाया जा रहा है।',
        'cancel_successful' => 'ID <b>:deposit_id</b> के साथ जमा रद्द किया जा रहा है।',
        'balance_transfer' => 'व्यवस्थापक से शेष राशि का हस्तांतरण।',
    ],

    'dialog' => [
        'cancel' => [
            'title' => 'क्या आप वाकई निश्चित हैं?',
            'description' => ':item <b>:value</b> को रद्द करें।',
            'cancel_button' => 'रद्द करें',
            'confirm_button' => 'हाँ, जारी रखें!',
        ],
        'approve' => [
            'title' => 'क्या आप पूरी तरह से सुनिश्चित हैं?',
            'description' => ':item <b>:value</b> को स्वीकृत करें।',
            'cancel_button' => 'रद्द करें',
            'confirm_button' => 'हाँ, जारी रखें!',
        ],
    ]
];

<?php

return [

    'create' => [
        'button' => 'Создать депозит!',
        'steps' => [
            'select_payment_method' => 'Выберите способ оплаты',
            'enter_amount' => 'Введите сумму депозита',
            'enter_e_wallet_number' => 'Введите номер электронного кошелька',
        ],
    ],

    'detail' => [
        'button' => 'Отменить депозит!',
        'cancel_dialog' => [
            'title' => 'Вы абсолютно уверены?',
            'description' => 'Отменить депозит с ID <strong>:deposit_id</strong>.',
            'cancel_button' => 'Отмена',
            'confirm_button' => 'Да, отменить!',
        ]
    ],

    'labels' => [
        'complete_payment' => 'Пожалуйста, завершите оплату.',
        'deposit_amount' => 'Сумма депозита',
        'total_balance' => 'Общий баланс',
        'total_payment' => 'Общая сумма к оплате',
        'e_wallet_number' => 'Номер электронного кошелька',
        'unique_code' => 'Уникальный код',
        'payment_status' => 'Статус оплаты',
        'expires_in' => 'Истекает через',
        'expires_text' => 'Осталось :hours ч, :minutes мин, :seconds сек',
        'virtual_account_number' => 'Номер виртуального счета',
        'payment_code' => 'Код платежа',
        'payment_target' => 'Цель платежа',
        'payment_link' => 'Ссылка на оплату',
        'qr_code' => 'QR-код',
    ],

    'toast' => [
        'unpaid_payment' => 'Пожалуйста, оплатите предыдущий депозит.',
        'payment_not_available' => 'Способ оплаты временно недоступен. Пожалуйста, используйте другой метод.',
        'create_successful' => 'Пожалуйста, завершите оплату.',
        'cancel_successful' => 'Депозит с ID <b>:deposit_id</b> успешно отменен.',
    ],

    'log' => [
        'process_successful' => 'Депозит с ID <b>:deposit_id</b> был успешно обработан.',
        'create_successful' => 'Создан депозит с ID <b>:deposit_id</b>.',
        'cancel_successful' => 'Отменен депозит с ID <b>:deposit_id</b>.',
        'balance_transfer' => 'Перевод баланса от администратора.',
    ],

    'dialog' => [
        'cancel' => [
            'title' => 'Вы абсолютно уверены?',
            'description' => 'Отменить :item <b>:value</b>.',
            'cancel_button' => 'Отмена',
            'confirm_button' => 'Да, продолжить!',
        ],
        'approve' => [
            'title' => 'Вы уверены?',
            'description' => 'Одобрить :item <b>:value</b>.',
            'cancel_button' => 'Отмена',
            'confirm_button' => 'Да, продолжить!',
        ],
    ]
];

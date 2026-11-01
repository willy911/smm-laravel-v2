<?php

return [
    'create' => [
        'button' => 'Fazer Depósito!',
        'steps' => [
            'select_payment_method' => 'Selecionar Pagamento',
            'enter_amount' => 'Inserir Valor do Depósito',
            'enter_e_wallet_number' => 'Inserir Nº da Carteira Eletrônica',
        ],
    ],

    'detail' => [
        'button' => 'Cancelar Depósito!',
        'cancel_dialog' => [
            'title' => 'Tem certeza?',
            'description' => 'Cancelar Depósito com ID <strong>:deposit_id</strong>.',
            'cancel_button' => 'Cancelar',
            'confirm_button' => 'Sim, Cancelar!',
        ]
    ],

    'labels' => [
        'complete_payment' => 'Por favor, conclua o pagamento.',
        'deposit_amount' => 'Valor do Depósito',
        'total_balance' => 'Saldo Total',
        'total_payment' => 'Pagamento Total',
        'e_wallet_number' => 'Nº da Carteira Eletrônica',
        'unique_code' => 'Código Único',
        'payment_status' => 'Status do Pagamento',
        'expires_in' => 'Expira Em',
        'expires_text' => ':hours horas, :minutes minutos, :seconds segundos restantes',
        'virtual_account_number' => 'Nº da Conta Virtual',
        'payment_code' => 'Código de Pagamento',
        'payment_target' => 'Alvo do Pagamento',
        'payment_link' => 'Link de Pagamento',
        'qr_code' => 'Código QR',
    ],

    'toast' => [
        'unpaid_payment' => 'Por favor, pague seu depósito anterior.',
        'payment_not_available' => 'O Método de Pagamento está temporariamente indisponível. Por favor, use outro método.',
        'create_successful' => 'Por favor, conclua seu pagamento.',
        'cancel_successful' => 'Depósito com ID <b>:deposit_id</b> cancelado com sucesso.',
    ],

    'log' => [
        'process_successful' => 'O depósito com ID <b>:deposit_id</b> foi processado com sucesso.',
        'create_successful' => 'Criando depósito com ID <b>:deposit_id</b>.',
        'cancel_successful' => 'Cancelando depósito com ID <b>:deposit_id</b>.',
        'balance_transfer' => 'Transferência de saldo do administrador.',
    ],

    'dialog' => [
        'cancel' => [
            'title' => 'Tem certeza?',
            'description' => 'Cancelar :item <b>:value</b>.',
            'cancel_button' => 'Cancelar',
            'confirm_button' => 'Sim, Continuar!',
        ],
        'approve' => [
            'title' => 'Tem certeza absoluta?',
            'description' => 'Aprovar :item <b>:value</b>.',
            'cancel_button' => 'Cancelar',
            'confirm_button' => 'Sim, continuar!',
        ],
    ]
];

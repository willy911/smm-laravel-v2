<?php

return [

    'create' => [
        'button' => 'Crea Deposito!',
        'steps' => [
            'select_payment_method' => 'Seleziona Pagamento',
            'enter_amount'   => 'Inserisci Importo Deposito',
            'enter_e_wallet_number' => 'Inserisci N. E-Wallet',
        ],
    ],

    'detail' => [
        'button' => 'Annulla Deposito!',
        'cancel_dialog' => [
            'title' => 'Sei veramente sicuro?',
            'description' => 'Annulla Deposito con ID <strong>:deposit_id</strong>.',
            'cancel_button' => 'Annulla',
            'confirm_button' => 'Sì, Annulla!',
        ]
    ],

    'labels' => [
        'complete_payment' => 'Per favore completa il pagamento.',
        'deposit_amount' => 'Importo Deposito',
        'total_balance'  => 'Saldo Totale',
        'total_payment'  => 'Pagamento Totale',
        'e_wallet_number' => 'N. E-Wallet',
        'unique_code'             => 'Codice Unico',
        'payment_status'          => 'Stato Pagamento',
        'expires_in'              => 'Scade Tra',
        'expires_text'  => ':hours ore, :minutes minuti, :seconds secondi rimanenti',
        'virtual_account_number' => 'N. Conto Virtuale',
        'payment_code' => 'Codice Pagamento',
        'payment_target' => 'Destinazione Pagamento',
        'payment_link' => 'Link Pagamento',
        'qr_code' => 'Codice QR',
    ],

    'toast' => [
        'unpaid_payment'       => 'Per favore salda il pagamento per il deposito precedente.',
        'payment_not_available' => 'Il metodo di pagamento non è attualmente disponibile. Per favore usa un altro metodo.',
        'create_successful'    => 'Per favore salda il pagamento.',
        'cancel_successful'    => 'Deposito con ID <b>:deposit_id</b> annullato con successo.',
    ],

    'log' => [
        'process_successful' => 'Il deposito con ID <b>:deposit_id</b> è stato elaborato con successo.',
        'create_successful'    => 'Creazione deposito con ID <b>:deposit_id</b>.',
        'cancel_successful'    => 'Annullamento deposito con ID <b>:deposit_id</b>.',
        'balance_transfer'     => 'Trasferimento saldo dall\'amministratore.',
    ],

    'dialog' => [
        'cancel' => [
            'title' => 'Sei veramente sicuro?',
            'description' => 'Annulla :item <b>:value</b>.',
            'cancel_button' => 'Annulla',
            'confirm_button' => 'Sì, Continua!',
        ],
        'approve' => [
            'title' => 'Sei assolutamente sicuro?',
            'description' => 'Approva :item <b>:value</b>.',
            'cancel_button' => 'Annulla',
            'confirm_button' => 'Sì, continua!',
        ],
    ]
];

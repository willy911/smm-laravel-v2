<?php

return [

    'create' => [
        'button' => 'Einzahlung Erstellen!',
        'steps' => [
            'select_payment_method' => 'Zahlungsmethode Auswählen',
            'enter_amount'   => 'Einzahlungsbetrag Eingeben',
            'enter_e_wallet_number' => 'E-Wallet-Nr. Eingeben',
        ],
    ],

    'detail' => [
        'button' => 'Einzahlung Stornieren!',
        'cancel_dialog' => [
            'title' => 'Sind Sie sich wirklich sicher?',
            'description' => 'Einzahlung mit ID <strong>:deposit_id</strong> stornieren.',
            'cancel_button' => 'Abbrechen',
            'confirm_button' => 'Ja, Stornieren!',
        ]
    ],

    'labels' => [
        'complete_payment' => 'Bitte Zahlung abschließen.',
        'deposit_amount' => 'Einzahlungsbetrag',
        'total_balance'  => 'Gesamtsaldo',
        'total_payment'  => 'Gesamtzahlung',
        'e_wallet_number' => 'E-Wallet-Nr.',
        'unique_code'             => 'Eindeutiger Code',
        'payment_status'          => 'Zahlungsstatus',
        'expires_in'              => 'Läuft Ab In',
        'expires_text'  => ':hours Stunden, :minutes Minuten, :seconds Sekunden verbleibend',
        'virtual_account_number' => 'Virtuelle Kontonummer',
        'payment_code' => 'Zahlungscode',
        'payment_target' => 'Zahlungsziel',
        'payment_link' => 'Zahlungslink',
        'qr_code' => 'QR-Code',
    ],

    'toast' => [
        'unpaid_payment'       => 'Bitte begleichen Sie Ihre Zahlung für die vorherige Einzahlung.',
        'payment_not_available' => 'Die Zahlungsmethode ist derzeit nicht verfügbar. Bitte verwenden Sie eine andere Methode.',
        'create_successful'    => 'Bitte begleichen Sie Ihre Zahlung.',
        'cancel_successful'    => 'Einzahlung mit ID <b>:deposit_id</b> erfolgreich storniert.',
    ],

    'log' => [
        'process_successful' => 'Die Einzahlung mit der ID <b>:deposit_id</b> wurde erfolgreich verarbeitet.',
        'create_successful'    => 'Einzahlung mit ID <b>:deposit_id</b> erstellen.',
        'cancel_successful'    => 'Einzahlung mit ID <b>:deposit_id</b> stornieren.',
        'balance_transfer'     => 'Saldoübertragung vom Administrator.',
    ],

    'dialog' => [
        'cancel' => [
            'title' => 'Sind Sie sich wirklich sicher?',
            'description' => ':item <b>:value</b> stornieren.',
            'cancel_button' => 'Abbrechen',
            'confirm_button' => 'Ja, Fortfahren!',
        ],
        'approve' => [
            'title' => 'Sind Sie wirklich sicher?',
            'description' => ':item <b>:value</b> genehmigen.',
            'cancel_button' => 'Abbrechen',
            'confirm_button' => 'Ja, fortfahren!',
        ],
    ]
];

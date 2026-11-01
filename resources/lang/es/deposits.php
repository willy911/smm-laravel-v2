<?php

return [

    'create' => [
        'button' => '¡Crear Depósito!',
        'steps' => [
            'select_payment_method' => 'Seleccionar Método de Pago',
            'enter_amount'   => 'Ingresar Cantidad del Depósito',
            'enter_e_wallet_number' => 'Ingresar No. de Billetera Electrónica',
        ],
    ],

    'detail' => [
        'button' => '¡Cancelar Depósito!',
        'cancel_dialog' => [
            'title' => '¿Estás completamente seguro?',
            'description' => 'Cancelar Depósito con ID <strong>:deposit_id</strong>.',
            'cancel_button' => 'Cancelar',
            'confirm_button' => '¡Sí, Cancelar!',
        ]
    ],

    'labels' => [
        'complete_payment' => 'Por favor completa el pago.',
        'deposit_amount' => 'Cantidad del Depósito',
        'total_balance'  => 'Saldo Total',
        'total_payment'  => 'Pago Total',
        'e_wallet_number' => 'No. de Billetera Electrónica',
        'unique_code'             => 'Código Único',
        'payment_status'          => 'Estado del Pago',
        'expires_in'              => 'Expira En',
        'expires_text'  => 'Quedan :hours horas, :minutes minutos, :seconds segundos',
        'virtual_account_number' => 'No. de Cuenta Virtual',
        'payment_code' => 'Código de Pago',
        'payment_target' => 'Destino del Pago',
        'payment_link' => 'Enlace de Pago',
        'qr_code' => 'Código QR',
    ],

    'toast' => [
        'unpaid_payment'       => 'Por favor completa el pago de tu depósito anterior.',
        'payment_not_available' => 'El método de pago no está disponible actualmente. Por favor usa otro método.',
        'create_successful'    => 'Por favor completa tu pago.',
        'cancel_successful'    => 'Depósito con ID <b>:deposit_id</b> cancelado exitosamente.',
    ],

    'log' => [
        'process_successful' => 'El depósito con ID <b>:deposit_id</b> se ha procesado correctamente.',
        'create_successful'    => 'Creando depósito con ID <b>:deposit_id</b>.',
        'cancel_successful'    => 'Cancelando depósito con ID <b>:deposit_id</b>.',
        'balance_transfer'     => 'Transferencia de saldo del administrador.',
    ],

    'dialog' => [
        'cancel' => [
            'title' => '¿Estás completamente seguro?',
            'description' => 'Cancelar :item <b>:value</b>.',
            'cancel_button' => 'Cancelar',
            'confirm_button' => '¡Sí, Continuar!',
        ],
        'approve' => [
            'title' => '¿Estás completamente seguro?',
            'description' => 'Aprobar :item <b>:value</b>.',
            'cancel_button' => 'Cancelar',
            'confirm_button' => 'Sí, continuar!',
        ],
    ]
];

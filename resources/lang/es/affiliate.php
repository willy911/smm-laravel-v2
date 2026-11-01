<?php

return [
    'information' => [
        'referral_description' => 'Los usuarios que se registren usando este enlace se convertirán automáticamente en tus referidos.',
        'balance_transfer_notice' => 'La comisión se transferirá a su saldo principal.',
        'bank_transfer_notice' => 'La comisión se transferirá a su cuenta bancaria.',
    ],

    'labels' => [
        'affiliate_balance' => 'Saldo de Afiliado',
        'commission_available' => 'Comisión Disponible',
        'total_referrals' => 'Total de Referidos',
        'total_earnings' => 'Ganancias Totales',
        'withdrawal_history' => 'Historial de Retiros',
        'your_affiliate_link' => 'Tu Enlace de Afiliado',
        'withdraw_commission' => 'Retirar Comisión',
    ],

    'log' => [
        'requested_commission_withdrawal' => 'Se solicitó un retiro de comisión de <b>:amount</b>.',
        'commission_withdrawal_to_bank_successful' => 'El retiro de comisión de <b>:amount</b> a la cuenta bancaria fue exitoso.',
        'commission_withdrawal_to_balance_successful' => 'El retiro de comisión de <b>:amount</b> al saldo principal fue exitoso.',
        'commission_received' => 'Se recibió una comisión de <b>:amount</b> del depósito del usuario <b>:user</b>.',
    ],

    'toast' => [
        'amount_required' => 'El monto es obligatorio.',
        'bank_name_required' => 'El nombre del banco es obligatorio.',
        'bank_account_name_required' => 'El nombre del titular de la cuenta es obligatorio.',
        'bank_account_number_required' => 'El número de cuenta bancaria es obligatorio.',
        'min_withdrawal' => 'El monto mínimo de retiro es <b>:amount</b>.',
        'max_withdrawal' => 'El monto máximo de retiro es <b>:amount</b>.',
        'commission_withdrawal_successful' => 'El retiro de comisión se ha creado correctamente.',
    ],
];

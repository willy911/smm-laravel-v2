<?php

return [
    'information' => [
        'referral_description' => 'Os usuários que se cadastrarem usando este link se tornarão automaticamente seus indicados.',
        'balance_transfer_notice' => 'A comissão será transferida para o seu saldo principal.',
        'bank_transfer_notice' => 'A comissão será transferida para a sua conta bancária.',
    ],

    'labels' => [
        'affiliate_balance' => 'Saldo de Afiliado',
        'commission_available' => 'Comissão Disponível',
        'total_referrals' => 'Total de Indicações',
        'total_earnings' => 'Ganhos Totais',
        'withdrawal_history' => 'Histórico de Saques',
        'your_affiliate_link' => 'Seu Link de Afiliado',
        'withdraw_commission' => 'Sacar Comissão',
    ],

    'log' => [
        'requested_commission_withdrawal' => 'Solicitado um saque de comissão no valor de <b>:amount</b>.',
        'commission_withdrawal_to_bank_successful' => 'O saque de comissão de <b>:amount</b> para a conta bancária foi realizado com sucesso.',
        'commission_withdrawal_to_balance_successful' => 'O saque de comissão de <b>:amount</b> para o saldo principal foi realizado com sucesso.',
        'commission_received' => 'Recebida uma comissão de <b>:amount</b> do depósito do usuário <b>:user</b>.',
    ],

    'toast' => [
        'amount_required' => 'O valor é obrigatório.',
        'bank_name_required' => 'O nome do banco é obrigatório.',
        'bank_account_name_required' => 'O nome do titular da conta é obrigatório.',
        'bank_account_number_required' => 'O número da conta bancária é obrigatório.',
        'min_withdrawal' => 'O valor mínimo de saque é <b>:amount</b>.',
        'max_withdrawal' => 'O valor máximo de saque é <b>:amount</b>.',
        'commission_withdrawal_successful' => 'O saque da comissão foi criado com sucesso.',
    ],
];

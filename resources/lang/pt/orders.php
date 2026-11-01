<?php

return [
    'create' => [
        'button' => 'Criar Pedido!',
    ],

    'labels' => [
        'average_time_and_quantity' => '<span class="font-medium text-green-600">:time</span> com quantidade média de pedidos <span class="font-medium text-green-600">:quantity</span>',
        'view_order_target_example' => 'Ver Exemplo de Alvo de Pedido',
        'order_target_example' => 'Exemplo de destino do pedido',
    ],

    'toast' => [
        'refill_successful' => 'Pedido de recarga de pedido criado com sucesso.',
        'cancel_successful' => 'Pedido de cancelamento de pedido criado com sucesso.',
        'invalid_order_id' => 'ID do Pedido inválido.',
        'wait_previous_order' => 'Aguarde o processamento do pedido anterior primeiro.',
        'min_quantity' => 'A quantidade mínima é :min.',
        'max_quantity' => 'A quantidade máxima é :max.',
        'mass_order_not_supported' => 'Este serviço não suporta pedidos em massa.',
        'order_created_with_target' => 'Pedido com ID <strong>:order_id</strong> = Alvo <strong>:order_target</strong> criado com sucesso.',
        'service_not_available' => 'Serviço não disponível.',
        'order_created' => 'Pedido criado com sucesso.',
        'insufficient_balance' => 'Seu saldo é insuficiente, Deposite Agora!',
    ],

    'log' => [
        'create_successful' => 'Criando Pedido com ID <b>:order_id</b>.',
        'create_api_successful' => 'Criando Pedido (API) com ID <b>:order_id</b>.',
        'create_single_successful' => 'Criando Pedido (Web - Único) com ID <b>:order_id</b>.',
        'create_mass_successful' => 'Criando Pedido (Web - Massa) com ID <b>:order_id</b>.',
        'refill_successful' => 'Criando Recarga de Pedido com ID <b>:order_refill_id</b>.',
        'cancel_successful' => 'Criando Cancelamento de Pedido com ID <b>:order_cancel_id</b>.',
        'refund_successful' => 'O reembolso do pedido com ID <b>:order_id</b> foi realizado com sucesso.',
    ],
];

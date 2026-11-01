<?php

return [
    'create' => [
        'button' => '¡Crear Pedido!',
    ],

    'labels' => [
        'average_time_and_quantity' => '<span class="font-medium text-green-600">:time</span> con cantidad promedio de pedidos <span class="font-medium text-green-600">:quantity</span>',
        'view_order_target_example' => 'Ver Ejemplo de Objetivo del Pedido',
        'order_target_example' => 'Ejemplo de objetivo del pedido',
    ],

    'toast' => [
        'refill_successful'    => 'Solicitud de recarga de pedido creada exitosamente.',
        'cancel_successful'    => 'Solicitud de cancelación de pedido creada exitosamente.',
        'invalid_order_id'     => 'ID de Pedido no válido.',
        'wait_previous_order' => 'Por favor espera a que se procese el pedido anterior primero.',
        'min_quantity' => 'La cantidad mínima es :min.',
        'max_quantity' => 'La cantidad máxima es :max.',
        'mass_order_not_supported' => 'Este servicio no admite pedidos masivos.',
        'order_created_with_target' => 'Pedido con ID <strong>:order_id</strong> = Objetivo <strong>:order_target</strong> creado exitosamente.',
        'service_not_available'     => 'El servicio no está disponible.',
        'order_created' => 'Pedido creado exitosamente.',
        'insufficient_balance' => 'Tu saldo es insuficiente, ¡Deposita Ahora!',
    ],

    'log' => [
        'create_successful'         => 'Creando Pedido con ID <b>:order_id</b>.',
        'create_api_successful'     => 'Creando Pedido (API) con ID <b>:order_id</b>.',
        'create_single_successful'  => 'Creando Pedido (Web - Individual) con ID <b>:order_id</b>.',
        'create_mass_successful'    => 'Creando Pedido (Web - Masivo) con ID <b>:order_id</b>.',
        'refill_successful' => 'Creando Recarga de Pedido con ID <b>:order_refill_id</b>.',
        'cancel_successful'     => 'Creando Cancelación de Pedido con ID <b>:order_cancel_id</b>.',
        'refund_successful' => 'El reembolso del pedido con ID <b>:order_id</b> se ha realizado correctamente.',
    ],
];

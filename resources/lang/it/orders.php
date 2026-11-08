<?php

return [
    'create' => [
        'button' => 'Crea Ordine!',
    ],

    'labels' => [
        'average_time_and_quantity' => '<span class="font-medium text-green-600">:time</span> con quantità media ordine <span class="font-medium text-green-600">:quantity</span>',
        'view_order_target_example' => 'Visualizza Esempio Obiettivo Ordine',
        'order_target_example' => "Esempio di obiettivo dell'ordine",
    ],

    'toast' => [
        'refill_successful'    => 'Richiesta ricarica ordine creata con successo.',
        'cancel_successful'    => 'Richiesta annullamento ordine creata con successo.',
        'cancel_failed' => 'The cancellation request for order ID :order_id failed to be processed by the provider. Please try again later or contact support.',
        'refill_failed' => 'The refill request for order ID :order_id failed to be processed by the provider. Please try again later or contact support.',
        'invalid_order_id'     => 'ID Ordine non valido.',
        'wait_previous_order' => 'Per favore attendi che l\'ordine precedente venga elaborato prima.',
        'min_quantity' => 'La quantità minima è :min.',
        'max_quantity' => 'La quantità massima è :max.',
        'mass_order_not_supported' => 'Questo servizio non supporta ordini in massa.',
        'order_created_with_target' => 'Ordine con ID <strong>:order_id</strong> = Obiettivo <strong>:order_target</strong> creato con successo.',
        'service_not_available'     => 'Il servizio non è disponibile.',
        'order_created' => 'Ordine creato con successo.',
        'insufficient_balance' => 'Il tuo saldo è insufficiente, Deposita Ora!',
    ],

    'log' => [
        'create_successful'         => 'Creazione Ordine con ID <b>:order_id</b>.',
        'create_api_successful'     => 'Creazione Ordine (API) con ID <b>:order_id</b>.',
        'create_single_successful'  => 'Creazione Ordine (Web - Singolo) con ID <b>:order_id</b>.',
        'create_mass_successful'    => 'Creazione Ordine (Web - Massa) con ID <b>:order_id</b>.',
        'refill_successful' => 'Creazione Ricarica Ordine con ID <b>:order_refill_id</b>.',
        'cancel_successful'     => 'Creazione Annullamento Ordine con ID <b>:order_cancel_id</b>.',
        'refund_successful' => 'Il rimborso per l’ordine con ID <b>:order_id</b> è stato completato con successo.',
    ],
];

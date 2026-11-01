<?php

return [
    'create' => [
        'button' => 'Bestellung Erstellen!',
    ],

    'labels' => [
        'average_time_and_quantity' => '<span class="font-medium text-green-600">:time</span> mit durchschnittlicher Bestellmenge <span class="font-medium text-green-600">:quantity</span>',
        'view_order_target_example' => 'Beispiel für Bestellziel Anzeigen',
        'order_target_example' => 'Beispiel für das Bestellziel',
    ],

    'toast' => [
        'refill_successful'    => 'Anfrage zur Nachfüllung der Bestellung erfolgreich erstellt.',
        'cancel_successful'    => 'Anfrage zur Stornierung der Bestellung erfolgreich erstellt.',
        'invalid_order_id'     => 'Bestell-ID ungültig.',
        'wait_previous_order' => 'Bitte warten Sie, bis die vorherige Bestellung zuerst bearbeitet wurde.',
        'min_quantity' => 'Die Mindestmenge beträgt :min.',
        'max_quantity' => 'Die Höchstmenge beträgt :max.',
        'mass_order_not_supported' => 'Dieser Service unterstützt keine Massenbestellungen.',
        'order_created_with_target' => 'Bestellung mit ID <strong>:order_id</strong> = Ziel <strong>:order_target</strong> erfolgreich erstellt.',
        'service_not_available'     => 'Der Service ist nicht verfügbar.',
        'order_created' => 'Bestellung erfolgreich erstellt.',
        'insufficient_balance' => 'Ihr Saldo ist unzureichend, Jetzt Einzahlen!',
    ],

    'log' => [
        'create_successful'         => 'Bestellung mit ID <b>:order_id</b> erstellen.',
        'create_api_successful'     => 'Bestellung (API) mit ID <b>:order_id</b> erstellen.',
        'create_single_successful'  => 'Bestellung (Web - Einzeln) mit ID <b>:order_id</b> erstellen.',
        'create_mass_successful'    => 'Bestellung (Web - Massen) mit ID <b>:order_id</b> erstellen.',
        'refill_successful' => 'Nachfüllung der Bestellung mit ID <b>:order_refill_id</b> erstellen.',
        'cancel_successful'     => 'Stornierung der Bestellung mit ID <b>:order_cancel_id</b> erstellen.',
        'refund_successful' => 'Die Rückerstattung für die Bestellung mit der ID <b>:order_id</b> war erfolgreich.',
    ],
];

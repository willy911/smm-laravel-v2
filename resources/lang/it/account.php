<?php

return [
    'email_verification' => [
        'title' => 'Verificação de Email',
        'check_email' => 'Por favor, verifique o email enviado para <b>:email</b> para confirmar a sua conta.',
        'resend_in_seconds' => 'Reenviar em :seconds segundos',
        'button' => 'Reenviar Email de Verificação',
        'toast' => [
            'email_verified_successful' => 'Email verificata con successo.',
            'email_resent_successful' => 'Email di verifica inviata nuovamente con successo.',
        ],
        'log' => [
            'email_verified_successful'     => 'Esecuzione verifica email.',
        ],
    ],
    'settings' => [
        'update_profile_button' => 'Aggiorna Profilo',
        'update_api_button' => 'Aggiorna API',

        'toast' => [
            'update_profile_successful' => 'Profilo aggiornato con successo.',
            'update_api_successful' => 'API aggiornata con successo.',
            'update_notification_successful' => 'Notifiche aggiornate con successo.',
        ],

        'log' => [
            'update_api_successful'            => 'Aggiornamento dati API.',
            'update_profile_successful'        => 'Aggiornamento profilo account.',
        ],
    ],
];

<?php

return [
    'email_verification' => [
        'title' => 'E-Mail-Verifizierung',
        'check_email' => 'Bitte überprüfe die an <b>:email</b> gesendete E-Mail, um dein Konto zu verifizieren.',
        'resend_in_seconds' => 'Erneut senden in :seconds Sekunden',
        'button' => 'Verifizierungs-E-Mail erneut senden',
        'toast' => [
            'email_verified_successful' => 'E-Mail erfolgreich verifiziert.',
            'email_resent_successful' => 'Verifizierungs-E-Mail erfolgreich erneut gesendet.',
        ],
        'log' => [
            'email_verified_successful'     => 'E-Mail-Verifizierung durchführen.',
        ],
    ],
    'settings' => [
        'update_profile_button' => 'Profil Aktualisieren',
        'update_api_button' => 'API Aktualisieren',

        'toast' => [
            'update_profile_successful' => 'Profil erfolgreich aktualisiert.',
            'update_api_successful' => 'API erfolgreich aktualisiert.',
            'update_notification_successful' => 'Benachrichtigungen erfolgreich aktualisiert.',
        ],

        'log' => [
            'update_api_successful'            => 'API-Daten aktualisieren.',
            'update_profile_successful'        => 'Kontoprofil aktualisieren.',
        ],
    ],
];

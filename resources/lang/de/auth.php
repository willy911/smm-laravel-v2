<?php

return [
    'signin' => [
        'header' => 'Willkommen zurück!',
        'description' => 'Melden Sie sich mit dem Konto an, das Sie registriert haben.',
        'button' => 'Anmelden',
        'cta' => [
            'signup_prefix' => 'Noch kein Konto?',
            'signup_link' => 'Jetzt Registrieren',
            'forgot_password_link' => 'Passwort vergessen?',
        ],
    ],

    'signup' => [
        'header' => 'Werden Sie Teil von uns!',
        'description' => 'Registrieren Sie sich jetzt und genießen Sie die besten Dienstleistungen!',
        'button' => 'Jetzt Registrieren',
        'cta' => [
            'signin_prefix' => 'Bereits ein Konto?',
            'signin_link' => 'Anmelden',
            'agreement_prefix' => 'Mit der Registrierung stimmen Sie unseren ',
            'agreement_link' => 'Nutzungsbedingungen',
            'agreement_suffix' => ' zu.',
            'agreement_button' => 'Gut, Ich Stimme Zu',
        ],
    ],

    'forgot_password' => [
        'header' => 'Passwort vergessen?',
        'description' => 'Geben Sie Ihre E-Mail-Adresse ein, um fortzufahren.',
        'button' => 'Zurücksetzen',
        'cta' => [
            'signin_prefix' => 'Passwort wieder eingefallen?',
            'signin_link' => 'Anmelden',
        ],
    ],

    'reset_password' => [
        'header' => 'Passwort Zurücksetzen',
        'description' => 'Stellen Sie Ihr Konto wieder her.',
        'button' => 'Zurücksetzen',
    ],

    'toast' => [
        'goodbye'         => 'Auf Wiedersehen...',
        'must_signin_first' => 'Bitte melden Sie sich zuerst an.',
        'account_deactivated' => 'Ihr Konto wurde deaktiviert.',
        'already_registered' => 'Sie haben bereits zuvor ein Konto registriert.',
        'signup_successful' => 'Registrierung erfolgreich, bitte melden Sie sich an.',
        'reset_email_sent'  => 'Bitte überprüfen Sie Ihre E-Mail. Wir haben eine E-Mail zum Zurücksetzen Ihres Passworts gesendet.',
        'user_not_found'        => 'Benutzer nicht gefunden.',
        'update_password'      => 'Ihr Passwort wurde erfolgreich aktualisiert.',
        'failed'  => 'Diese Anmeldedaten stimmen nicht mit unseren Daten überein.',
        'throttle' => 'Zu viele Anmeldeversuche. Bitte versuchen Sie es in :seconds Sekunden erneut.',
    ],

    'log' => [
        'signup_successful' => 'Registrierung erfolgreich.',
        'signin_to_dashboard'   => 'Anmeldung zum Dashboard.',
        'signout_from_dashboard' => 'Abmeldung vom Dashboard.',
        'update_password'   => 'Passwortänderung durchführen.',
    ],
];

<?php

return [
    'signin' => [
        'header' => 'Bentornato!',
        'description' => 'Accedi con l\'account che hai registrato.',
        'button' => 'Accedi',
        'cta' => [
            'signup_prefix' => 'Non hai ancora un account?',
            'signup_link' => 'Registrati Ora',
            'forgot_password_link' => 'Password Dimenticata?',
        ],
    ],

    'signup' => [
        'header' => 'Diventa parte di noi!',
        'description' => 'Registrati ora e goditi i migliori servizi!',
        'button' => 'Registrati Ora',
        'cta' => [
            'signin_prefix' => 'Hai già un account?',
            'signin_link' => 'Accedi',
            'agreement_prefix' => 'Registrandoti, accetti i nostri ',
            'agreement_link' => 'Termini e Condizioni di Servizio',
            'agreement_suffix' => '.',
            'agreement_button' => 'Bene, Accetto',
        ],
    ],

    'forgot_password' => [
        'header' => 'Password Dimenticata?',
        'description' => 'Inserisci la tua email per continuare.',
        'button' => 'Reimposta',
        'cta' => [
            'signin_prefix' => 'Ricordato la password?',
            'signin_link' => 'Accedi',
        ],
    ],

    'reset_password' => [
        'header' => 'Reimposta Password',
        'description' => 'Ripristina il tuo account.',
        'button' => 'Reimposta',
    ],

    'toast' => [
        'goodbye'         => 'Arrivederci...',
        'must_signin_first' => 'Per favore accedi prima.',
        'account_deactivated' => 'Il tuo account è stato disattivato.',
        'already_registered' => 'Hai già registrato un account in precedenza.',
        'signup_successful' => 'Registrazione completata con successo, per favore accedi.',
        'reset_email_sent'  => 'Per favore controlla la tua email. Abbiamo inviato un\'email per reimpostare la tua password.',
        'user_not_found'        => 'Utente non trovato.',
        'update_password'      => 'La tua password è stata aggiornata con successo.',
        'failed'  => 'Queste credenziali non corrispondono ai nostri dati.',
        'throttle' => 'Troppi tentativi di accesso. Per favore riprova tra :seconds secondi.',
    ],

    'log' => [
        'signup_successful' => 'Registrazione completata con successo.',
        'signin_to_dashboard'   => 'Accesso alla Dashboard.',
        'signout_from_dashboard' => 'Disconnessione dalla Dashboard.',
        'update_password'   => 'Esecuzione modifica Password.',
    ],
];

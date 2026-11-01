<?php

return [
    'email_verification' => [
        'title' => 'Verificación de Correo Electrónico',
        'check_email' => 'Por favor, revisa el correo enviado a <b>:email</b> para verificar tu cuenta.',
        'resend_in_seconds' => 'Reenviar en :seconds segundos',
        'button' => 'Reenviar Correo de Verificación',
        'toast' => [
            'email_verified_successful' => 'Correo electrónico verificado exitosamente.',
            'email_resent_successful' => 'Correo de verificación reenviado exitosamente.',
        ],
        'log' => [
            'email_verified_successful'     => 'Realizando verificación de correo electrónico.',
        ],
    ],
    'settings' => [
        'update_profile_button' => 'Actualizar Perfil',
        'update_api_button' => 'Actualizar API',

        'toast' => [
            'update_profile_successful' => 'Perfil actualizado exitosamente.',
            'update_api_successful' => 'API actualizado exitosamente.',
            'update_notification_successful' => 'Notificaciones actualizadas exitosamente.',
        ],

        'log' => [
            'update_api_successful'            => 'Actualizando datos de API.',
            'update_profile_successful'        => 'Actualizando perfil de cuenta.',
        ],
    ],
];

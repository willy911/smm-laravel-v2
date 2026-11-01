<?php

return [
    'email_verification' => [
        'title' => 'Verificação de Email',
        'check_email' => 'Por favor, verifique o email enviado para <b>:email</b> para confirmar a sua conta.',
        'resend_in_seconds' => 'Reenviar em :seconds segundos',
        'button' => 'Reenviar Email de Verificação',
        'toast' => [
            'email_verified_successful' => 'E-mail verificado com sucesso.',
            'email_resent_successful' => 'E-mail de verificação reenviado com sucesso.',
        ],
        'log' => [
            'email_verified_successful' => 'Realizando verificação de e-mail.',
        ],
    ],
    'settings' => [
        'update_profile_button' => 'Atualizar Perfil',
        'update_api_button' => 'Atualizar API',

        'toast' => [
            'update_profile_successful' => 'Perfil atualizado com sucesso.',
            'update_api_successful' => 'API atualizada com sucesso.',
            'update_notification_successful' => 'Notificação atualizada com sucesso.',
        ],

        'log' => [
            'update_api_successful' => 'Atualizando dados da API.',
            'update_profile_successful' => 'Atualizando perfil da conta.',
        ],
    ],
];

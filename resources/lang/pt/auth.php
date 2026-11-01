<?php

return [
    'signin' => [
        'header' => 'Bem-vindo de volta!',
        'description' => 'Entre com a conta que você registrou.',
        'button' => 'Entrar',
        'cta' => [
            'signup_prefix' => 'Ainda não tem uma conta?',
            'signup_link' => 'Cadastre-se Agora',
            'forgot_password_link' => 'Esqueceu a Senha?',
        ],
    ],

    'signup' => [
        'header' => 'Faça parte de nós!',
        'description' => 'Cadastre-se agora e desfrute dos melhores serviços!',
        'button' => 'Cadastre-se Agora',
        'cta' => [
            'signin_prefix' => 'Já tem uma conta?',
            'signin_link' => 'Entrar',
            'agreement_prefix' => 'Ao se cadastrar, você concorda com nossos ',
            'agreement_link' => 'Termos e Condições de Serviço',
            'agreement_suffix' => '.',
            'agreement_button' => 'Ok, Eu Concordo',
        ],
    ],

    'forgot_password' => [
        'header' => 'Esqueceu a Senha?',
        'description' => 'Insira seu e-mail para continuar.',
        'button' => 'Redefinir',
        'cta' => [
            'signin_prefix' => 'Já se lembrou da senha?',
            'signin_link' => 'Entrar',
        ],
    ],

    'reset_password' => [
        'header' => 'Redefinir Senha',
        'description' => 'Recupere sua conta.',
        'button' => 'Redefinir',
    ],

    'toast' => [
        'goodbye' => 'Até logo...',
        'must_signin_first' => 'Por favor, entre primeiro.',
        'account_deactivated' => 'Sua conta está desativada.',
        'already_registered' => 'Você já registrou uma conta anteriormente.',
        'signup_successful' => 'Registro bem-sucedido, por favor, entre.',
        'reset_email_sent' => 'Por favor, verifique seu e-mail. Enviamos um e-mail para redefinir sua senha.',
        'user_not_found' => 'Usuário não encontrado.',
        'update_password' => 'Sua senha foi atualizada com sucesso.',
        'failed' => 'Essas credenciais não correspondem aos nossos registros.',
        'throttle' => 'Muitas tentativas de login. Por favor, tente novamente em :seconds segundos.',
    ],

    'log' => [
        'signup_successful' => 'Registro bem-sucedido.',
        'signin_to_dashboard' => 'Entrou no Painel.',
        'signout_from_dashboard' => 'Saiu do Painel.',
        'update_password' => 'Realizou a alteração de Senha.',
    ],
];

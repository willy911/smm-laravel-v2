<?php

return [
    'signin' => [
        'header' => '¡Bienvenido de nuevo!',
        'description' => 'Inicia sesión con la cuenta que has registrado.',
        'button' => 'Iniciar Sesión',
        'cta' => [
            'signup_prefix' => '¿No tienes cuenta?',
            'signup_link' => 'Regístrate Ahora',
            'forgot_password_link' => '¿Olvidaste tu Contraseña?',
        ],
    ],

    'signup' => [
        'header' => '¡Únete a nosotros!',
        'description' => '¡Regístrate ahora y disfruta de los mejores servicios!',
        'button' => 'Regístrate Ahora',
        'cta' => [
            'signin_prefix' => '¿Ya tienes cuenta?',
            'signin_link' => 'Iniciar Sesión',
            'agreement_prefix' => 'Al registrarte, has aceptado nuestros ',
            'agreement_link' => 'Términos y Condiciones de Servicio',
            'agreement_suffix' => '.',
            'agreement_button' => 'De Acuerdo, Acepto',
        ],
    ],

    'forgot_password' => [
        'header' => '¿Olvidaste tu Contraseña?',
        'description' => 'Ingresa tu correo electrónico para continuar.',
        'button' => 'Restablecer',
        'cta' => [
            'signin_prefix' => '¿Recordaste tu contraseña?',
            'signin_link' => 'Iniciar Sesión',
        ],
    ],

    'reset_password' => [
        'header' => 'Restablecer Contraseña',
        'description' => 'Recupera tu cuenta.',
        'button' => 'Restablecer',
    ],

    'toast' => [
        'goodbye'         => '¡Hasta pronto...',
        'must_signin_first' => 'Por favor, inicia sesión primero.',
        'account_deactivated' => 'Tu cuenta ha sido desactivada.',
        'already_registered' => 'Ya has registrado una cuenta anteriormente.',
        'signup_successful' => 'Registro exitoso, por favor inicia sesión.',
        'reset_email_sent'  => 'Por favor revisa tu correo electrónico. Hemos enviado un correo para restablecer tu contraseña.',
        'user_not_found'        => 'Usuario no encontrado.',
        'update_password'      => 'Tu contraseña ha sido actualizada exitosamente.',
        'failed'  => 'Las credenciales no coinciden con nuestros datos.',
        'throttle' => 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en :seconds segundos.',
    ],

    'log' => [
        'signup_successful' => 'Registro exitoso.',
        'signin_to_dashboard'   => 'Inicio de sesión al Panel.',
        'signout_from_dashboard' => 'Cierre de sesión del Panel.',
        'update_password'   => 'Realizando cambio de Contraseña.',
    ],
];

<?php

return [
    'email_verification' => [
        'title' => 'Подтверждение электронной почты',
        'check_email' => 'Пожалуйста, проверьте свою почту по адресу <b>:email</b>, чтобы подтвердить свою учетную запись.',
        'resend_in_seconds' => 'Повторная отправка через :seconds секунд',
        'button' => 'Отправить письмо для подтверждения снова',
        'toast' => [
            'email_verified_successful' => 'Email успешно подтвержден.',
            'email_resent_successful' => 'Письмо для подтверждения email успешно отправлено повторно.',
        ],
        'log' => [
            'email_verified_successful' => 'Выполнена верификация email.',
        ],
    ],
    'settings' => [
        'update_profile_button' => 'Обновить профиль',
        'update_api_button' => 'Обновить API',

        'toast' => [
            'update_profile_successful' => 'Профиль успешно обновлен.',
            'update_api_successful' => 'API успешно обновлен.',
            'update_notification_successful' => 'Уведомления успешно обновлены.',
        ],

        'log' => [
            'update_api_successful' => 'Обновление данных API.',
            'update_profile_successful' => 'Обновление профиля аккаунта.',
        ],
    ],
];

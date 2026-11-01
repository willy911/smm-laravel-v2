<?php

return [
    'email_verification' => [
        'title' => 'تأكيد البريد الإلكتروني',
        'check_email' => 'يرجى التحقق من البريد المرسل إلى <b>:email</b> لتفعيل حسابك.',
        'resend_in_seconds' => 'إعادة الإرسال خلال :seconds ثانية',
        'button' => 'إعادة إرسال رسالة التفعيل',
        'toast' => [
            'email_verified_successful' => 'تم التحقق من البريد الإلكتروني بنجاح.',
            'email_resent_successful' => 'تم إعادة إرسال بريد التحقق بنجاح.',
        ],
        'log' => [
            'email_verified_successful'     => 'إجراء التحقق من البريد الإلكتروني.',
        ],
    ],
    'settings' => [
        'update_profile_button' => 'تحديث الملف الشخصي',
        'update_api_button' => 'تحديث API',

        'toast' => [
            'update_profile_successful' => 'تم تحديث الملف الشخصي بنجاح.',
            'update_api_successful' => 'تم تحديث API بنجاح.',
            'update_notification_successful' => 'تم تحديث الإشعارات بنجاح.',
        ],

        'log' => [
            'update_api_successful'            => 'تحديث بيانات API.',
            'update_profile_successful'        => 'تحديث ملف الحساب الشخصي.',
        ],
    ],
];

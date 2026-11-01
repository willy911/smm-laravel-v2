<?php

return [
    'signin' => [
        'header' => 'مرحباً بعودتك!',
        'description' => 'قم بتسجيل الدخول باستخدام الحساب الذي قمت بتسجيله.',
        'button' => 'تسجيل الدخول',
        'cta' => [
            'signup_prefix' => 'ليس لديك حساب؟',
            'signup_link' => 'سجل الآن',
            'forgot_password_link' => 'نسيت كلمة المرور؟',
        ],
    ],

    'signup' => [
        'header' => 'كن جزءاً منا!',
        'description' => 'سجل الآن واستمتع بأفضل الخدمات!',
        'button' => 'سجل الآن',
        'cta' => [
            'signin_prefix' => 'لديك حساب بالفعل؟',
            'signin_link' => 'تسجيل الدخول',
            'agreement_prefix' => 'بالتسجيل، أنت توافق على ',
            'agreement_link' => 'شروط وأحكام الخدمة',
            'agreement_suffix' => ' الخاصة بنا.',
            'agreement_button' => 'حسناً، أوافق',
        ],
    ],

    'forgot_password' => [
        'header' => 'نسيت كلمة المرور؟',
        'description' => 'أدخل بريدك الإلكتروني للمتابعة.',
        'button' => 'إعادة التعيين',
        'cta' => [
            'signin_prefix' => 'تذكرت كلمة المرور؟',
            'signin_link' => 'تسجيل الدخول',
        ],
    ],

    'reset_password' => [
        'header' => 'إعادة تعيين كلمة المرور',
        'description' => 'استعد حسابك.',
        'button' => 'إعادة التعيين',
    ],

    'toast' => [
        'goodbye'         => 'إلى اللقاء...',
        'must_signin_first' => 'يرجى تسجيل الدخول أولاً.',
        'account_deactivated' => 'تم تعطيل حسابك.',
        'already_registered' => 'لقد قمت بتسجيل حساب مسبقاً.',
        'signup_successful' => 'تم التسجيل بنجاح، يرجى تسجيل الدخول.',
        'reset_email_sent'  => 'يرجى التحقق من بريدك الإلكتروني. لقد أرسلنا بريداً إلكترونياً لإعادة تعيين كلمة المرور الخاصة بك.',
        'user_not_found'        => 'المستخدم غير موجود.',
        'update_password'      => 'تم تحديث كلمة المرور الخاصة بك بنجاح.',
        'failed'  => 'هذه الهوية لا تطابق بياناتنا.',
        'throttle' => 'محاولات تسجيل دخول كثيرة جداً. يرجى المحاولة مرة أخرى خلال :seconds ثانية.',
    ],

    'log' => [
        'signup_successful' => 'تم التسجيل بنجاح.',
        'signin_to_dashboard'   => 'تسجيل الدخول إلى لوحة التحكم.',
        'signout_from_dashboard' => 'تسجيل الخروج من لوحة التحكم.',
        'update_password'   => 'إجراء تغيير كلمة المرور.',
    ],
];

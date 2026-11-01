<?php

return [
    'signin' => [
        'header' => 'Maligayang pagbabalik!',
        'description' => 'Mag-sign in gamit ang account na iyong nirehistro.',
        'button' => 'Mag-sign In',
        'cta' => [
            'signup_prefix' => 'Wala ka pang account?',
            'signup_link' => 'Mag-register Ngayon',
            'forgot_password_link' => 'Nakalimutan ang Password?',
        ],
    ],

    'signup' => [
        'header' => 'Maging bahagi namin!',
        'description' => 'Mag-register ngayon at tangkilikin ang pinakamahusay na serbisyo!',
        'button' => 'Mag-register Ngayon',
        'cta' => [
            'signin_prefix' => 'Mayroon ka nang account?',
            'signin_link' => 'Mag-sign In',
            'agreement_prefix' => 'Sa pamamagitan ng pagrehistro, ikaw ay sumasang-ayon sa ',
            'agreement_link' => 'Mga Tuntunin at Kundisyon ng Serbisyo',
            'agreement_suffix' => ' namin.',
            'agreement_button' => 'Oo, Sumasang-ayon Ako',
        ],
    ],

    'forgot_password' => [
        'header' => 'Nakalimutan ang Password?',
        'description' => 'Ilagay ang iyong email upang magpatuloy.',
        'button' => 'I-reset',
        'cta' => [
            'signin_prefix' => 'Naaalala mo na ang iyong password?',
            'signin_link' => 'Mag-sign In',
        ],
    ],

    'reset_password' => [
        'header' => 'I-reset ang Password',
        'description' => 'Ibalik ang iyong account.',
        'button' => 'I-reset',
    ],

    'toast' => [
        'goodbye'              => 'Hanggang sa muli...',
        'must_signin_first'    => 'Mangyaring mag-sign in muna.',
        'account_deactivated'  => 'Na-deactivate ang iyong account.',
        'already_registered'   => 'Mayroon ka nang nairehistrong account.',
        'signup_successful'    => 'Matagumpay ang pagrehistro. Mangyaring mag-sign in.',
        'reset_email_sent'     => 'Mangyaring suriin ang iyong email. Nagpadala kami ng email para sa pag-reset ng iyong password.',
        'user_not_found'       => 'Hindi nahanap ang user.',
        'update_password'     => 'Matagumpay na na-update ang iyong password.',
        'failed'               => 'Hindi tumutugma ang impormasyong ibinigay sa aming mga tala.',
        'throttle'             => 'Masyadong maraming pagtatangkang mag-sign in. Pakisubukang muli pagkatapos ng :seconds segundo.',
    ],

    'log' => [
        'signup_successful'       => 'Matagumpay na nagrehistro.',
        'signin_to_dashboard'     => 'Pumasok sa Dashboard.',
        'signout_from_dashboard'  => 'Lumabas mula sa Dashboard.',
        'update_password'         => 'Nag-update ng Password.',
    ],
];

<?php

return [
    'email_verification' => [
        'title' => 'Email Verification',
        'check_email' => 'Please check your email at <b>:email</b> to verify your account.',
        'resend_in_seconds' => 'Resend In :seconds',
        'button' => 'Resend Verification Email',
        'toast' => [
            'email_verified_successful' => 'Email successfully verified.',
            'email_resent_successful' => 'Verification email successfully resent.',
        ],
        'log' => [
            'email_verified_successful' => 'Performed email verification.',
        ],
    ],
    'settings' => [
        'update_profile_button' => 'Update Profile',
        'update_api_button' => 'Update API',

        'toast' => [
            'update_profile_successful' => 'Profile successfully updated.',
            'update_api_successful' => 'API successfully updated.',
            'update_notification_successful' => 'Notification successfully updated.',
        ],

        'log' => [
            'update_api_successful' => 'Updated API data.',
            'update_profile_successful' => 'Updated account profile.',
        ],
    ],
];

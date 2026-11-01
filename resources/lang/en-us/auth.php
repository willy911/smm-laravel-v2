<?php

return [
    'signin' => [
        'title' => 'Sign In',
        'header' => 'Welcome Back!',
        'description' => 'Sign in using your registered account.',
        'button' => 'Sign In',
        'cta' => [
            'signup_prefix' => 'Don\'t have an account?',
            'signup_link' => 'Sign Up Now',
            'forgot_password_link' => 'Forgot Password?',
        ],
    ],

    'signup' => [
        'title' => 'Sign Up',
        'header' => 'Join Us!',
        'description' => 'Sign up now and enjoy our best services!',
        'button' => 'Sign Up Now',
        'cta' => [
            'signin_prefix' => 'Already have an account?',
            'signin_link' => 'Sign In',
            'agreement_prefix' => 'By signing up, you agree to our ',
            'agreement_link' => 'Terms of Service',
            'agreement_suffix' => '.',
            'agreement_button' => 'I Agree',
        ],
    ],

    'signout' => [
        'title' => 'Sign Out',
    ],

    'forgot_password' => [
        'title' => 'Forgot Password',
        'header' => 'Forgot Your Password?',
        'description' => 'Enter your email to continue.',
        'button' => 'Reset Password',
        'cta' => [
            'signin_prefix' => 'Remembered your password?',
            'signin_link' => 'Sign In',
        ],
    ],

    'reset_password' => [
        'title' => 'Reset Password',
        'header' => 'Reset Your Password',
        'description' => 'Recover your account.',
        'button' => 'Reset Password',
    ],

    'toast' => [
        'goodbye' => 'Goodbye...',
        'must_signin_first' => 'Please sign in first.',
        'account_deactivated' => 'Your account deactivated.',
        'already_registered' => 'You already registered an account.',
        'signup_successful' => 'Registration successful, please sign in.',
        'reset_email_sent' => 'Please check your email. We sent an email to reset your password.',
        'user_not_found' => 'User not found.',
        'update_password' => 'Password updated successfully.',
        'failed' => 'These credentials do not match our records.',
        'throttle' => 'Too many sign-in attempts. Please try again in :seconds seconds.',
    ],

    'log' => [
        'signup_successful' => 'Registration successful.',
        'signin_to_dashboard' => 'Signed in to Dashboard.',
        'signout_from_dashboard' => 'Signed out from Dashboard.',
        'update_password' => 'Password changed.',
    ],
];

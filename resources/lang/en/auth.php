<?php

return [
    'signin' => [
        'header' => 'Welcome back!',
        'description' => 'Sign in with the account you have registered.',
        'button' => 'Sign In',
        'cta' => [
            'signup_prefix' => 'Don\'t have an account?',
            'signup_link' => 'Sign Up Now',
            'forgot_password_link' => 'Forgot Password?',
        ],
    ],

    'signup' => [
        'header' => 'Be a part of us!',
        'description' => 'Sign up now and enjoy the best service!',
        'button' => 'Sign Up Now',
        'cta' => [
            'signin_prefix' => 'Already have an account?',
            'signin_link' => 'Sign In',
            'agreement_prefix' => 'By signing up, you agree to our ',
            'agreement_link' => 'Terms & Conditions of Service',
            'agreement_suffix' => '.',
            'agreement_button' => 'Okay, I Agree',
        ],
    ],

    'forgot_password' => [
        'header' => 'Forgot Password?',
        'description' => 'Enter your email to continue.',
        'button' => 'Reset Password',
        'cta' => [
            'signin_prefix' => 'Already remember your password?',
            'signin_link' => 'Sign In',
        ],
    ],

    'reset_password' => [
        'header' => 'Reset Password',
        'description' => 'Recover your account.',
        'button' => 'Reset Password',
    ],

    'toast' => [
        'goodbye' => 'See you again...',
        'must_signin_first' => 'Please sign in first.',
        'account_deactivated' => 'Your account is deactivated.',
        'already_registered' => 'You have registered an account previously.',
        'signup_successful' => 'Sign up successful, please sign in.',
        'reset_email_sent' => 'Please check your email. We have sent an email to reset your password.',
        'user_not_found' => 'User not found.',
        'update_password' => 'Your password successfully updated.',
        'failed' => 'These credentials do not match our records.',
        'throttle' => 'Too many sign in attempts. Please try again in :seconds seconds.',
    ],

    'log' => [
        'signup_successful' => 'Successful sign up.',
        'signin_to_dashboard' => 'Signed in to Dashboard.',
        'signout_from_dashboard' => 'Signed out from Dashboard.',
        'update_password' => 'Performed password change.',
    ],
];

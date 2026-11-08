<?php

return [
    'title' => 'Orders',

    'create' => [
        'title'  => 'Create',
        'button' => 'Create Order!',
    ],

    'list' => [
        'title' => 'List',
    ],

    'refill' => [
        'title' => 'Refill',
    ],

    'labels' => [
        'view_order_target_example' => 'View Order Target Example',
        'average_time_and_quantity' => '<span class="font-medium text-green-600">:time</span> with an average order quantity <span class="font-medium text-green-600">:quantity</span>',
    ],

    'toast' => [
        'refill_successful' => 'Order refill request created successfully.',
        'cancel_successful' => 'Order cancellation request created successfully.',
        'cancel_failed' => 'The cancellation request for order ID :order_id failed to be processed by the provider. Please try again later or contact support.',
        'refill_failed' => 'The refill request for order ID :order_id failed to be processed by the provider. Please try again later or contact support.',
        'invalid_order_id'  => 'Invalid order ID.',
        'wait_previous_order' => 'Please wait for the previous order to be processed first.',
        'min_quantity' => 'Minimum quantity is :min.',
        'max_quantity' => 'Maximum quantity is :max.',
        'mass_order_not_supported' => 'This service does not support mass orders.',
        'order_created_with_target' => 'Order with ID <strong>:order_id</strong> = Target <strong>:order_target</strong> created successfully.',
        'service_not_available'     => 'Service not available.',
        'order_created'       => 'Order created successfully.',
        'insufficient_balance' => 'Your balance is insufficient. Deposit now!',
    ],

    'log' => [
        'create_successful'        => 'Created order with ID <b>:order_id</b>.',
        'create_api_successful'    => 'Created order (API) with ID <b>:order_id</b>.',
        'create_single_successful' => 'Created order (Web - Single) with ID <b>:order_id</b>.',
        'create_mass_successful'   => 'Created order (Web - Mass) with ID <b>:order_id</b>.',
        'refill_successful'        => 'Created order refill with ID <b>:order_refill_id</b>.',
        'cancel_successful'        => 'Created order cancellation with ID <b>:order_cancel_id</b>.',
    ],
];

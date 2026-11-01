<?php

return [
    'create' => [
        'button' => 'Create Order!',
    ],

    'labels' => [
        'average_time_and_quantity' => '<span class="font-medium text-green-600">:time</span> with an average order quantity of <span class="font-medium text-green-600">:quantity</span>',
        'view_order_target_example' => 'View Order Target Example',
        'order_target_example' => 'Order Target Example',
    ],

    'toast' => [
        'refill_successful' => 'Order refill request successfully created.',
        'cancel_successful' => 'Order cancellation request successfully created.',
        'invalid_order_id' => 'Invalid Order ID.',
        'wait_previous_order' => 'Please wait for the previous order to be processed first.',
        'min_quantity' => 'Minimum quantity is :min.',
        'max_quantity' => 'Maximum quantity is :max.',
        'mass_order_not_supported' => 'This service does not support mass orders.',
        'order_created_with_target' => 'Order with ID <strong>:order_id</strong> = Target <strong>:order_target</strong> successfully created.',
        'service_not_available' => 'Service not available.',
        'order_created' => 'Order successfully created.',
        'insufficient_balance' => 'Insufficient balance. Deposit Now!',
        'review_successful' => 'Review submitted successfully. It will appear after admin moderation.',
        'already_reviewed' => 'You have already reviewed this service.',
    ],

    'log' => [
        'create_successful' => 'Created Order with ID <b>:order_id</b>.',
        'create_api_successful' => 'Created Order (API) with ID <b>:order_id</b>.',
        'create_single_successful' => 'Created Order (Web - Single) with ID <b>:order_id</b>.',
        'create_mass_successful' => 'Created Order (Web - Mass) with ID <b>:order_id</b>.',
        'refill_successful' => 'Created Order Refill with ID <b>:order_refill_id</b>.',
        'cancel_successful' => 'Created Order Cancellation with ID <b>:order_cancel_id</b>.',
        'refund_successful' => 'The refund for the order with ID <b>:order_id</b> was successful.',
        'review_successful' => 'Submitted a review for order ID <b>:order_id</b>.',
    ],
];

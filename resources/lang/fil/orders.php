<?php

return [
    'create' => [
        'button' => 'Gumawa ng Order!',
    ],

    'labels' => [
        'average_time_and_quantity' => '<span class="font-medium text-green-600">:time</span> na may average na dami ng order na <span class="font-medium text-green-600">:quantity</span>',
        'view_order_target_example' => 'Tingnan ang Halimbawa ng Target ng Order',
        'order_target_example' => 'Halimbawa ng Target ng Order',
    ],

    'toast' => [
        'refill_successful'    => 'Matagumpay na nagawa ang request para sa refill ng order.',
        'cancel_successful'    => 'Matagumpay na nagawa ang request para sa pagkansela ng order.',
        'cancel_failed' => 'The cancellation request for order ID :order_id failed to be processed by the provider. Please try again later or contact support.',
        'refill_failed' => 'The refill request for order ID :order_id failed to be processed by the provider. Please try again later or contact support.',
        'invalid_order_id'     => 'Hindi valid ang Order ID.',
        'wait_previous_order'  => 'Mangyaring hintayin munang maproseso ang nakaraang order.',
        'min_quantity'         => 'Ang minimum na dami ay :min.',
        'max_quantity'         => 'Ang maximum na dami ay :max.',
        'mass_order_not_supported' => 'Hindi sinusuportahan ng serbisyong ito ang mass order.',
        'order_created_with_target' => 'Matagumpay na nagawa ang order na may ID <strong>:order_id</strong> = Target <strong>:order_target</strong>.',
        'service_not_available'     => 'Hindi available ang serbisyo.',
        'order_created' => 'Matagumpay na nagawa ang order.',
        'insufficient_balance' => 'Hindi sapat ang iyong balanse, Mag-deposit ngayon!',
    ],

    'log' => [
        'create_successful'         => 'Gumawa ng Order na may ID <b>:order_id</b>.',
        'create_api_successful'     => 'Gumawa ng Order (API) na may ID <b>:order_id</b>.',
        'create_single_successful'  => 'Gumawa ng Order (Web - Single) na may ID <b>:order_id</b>.',
        'create_mass_successful'    => 'Gumawa ng Order (Web - Mass) na may ID <b>:order_id</b>.',
        'refill_successful'         => 'Gumawa ng Refill ng Order na may ID <b>:order_refill_id</b>.',
        'cancel_successful'         => 'Gumawa ng Pagkansela ng Order na may ID <b>:order_cancel_id</b>.',
        'refund_successful'         => 'Naibalik ang bayad para sa Order na may ID <b>:order_id</b>.'
    ],
];

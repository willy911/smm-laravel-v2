<?php

return [
    'title' => 'Services',

    'list' => [
        'title' => 'List',
    ],

    'monitoring' => [
        'title' => 'Monitoring',
    ],

    'updates' => [
        'title' => 'Updates',
        'labels' => [
            'updated'        => 'Updated',
            'price_increased' => 'Price Increased',
            'price_decreased' => 'Price Decreased',
            'enabled'         => 'Enabled',
            'disabled'        => 'Disabled',
            'added'           => 'Added',
            'deleted'         => 'Deleted',
        ],
        'description' => [
            'min_updated' => 'Minimum quantity updated from :from to :to.',
            'max_updated' => 'Maximum quantity updated from :from to :to.',
            'type_updated' => 'Type updated from <b>:from</b> to <b>:to</b>.',
            'refill_support_updated' => 'Refill support updated from <b>:from</b> to <b>:to</b>.',
            'cancel_support_updated' => 'Cancel support updated from <b>:from</b> to <b>:to</b>.',
            'price_increased' => 'Price increased from :from to :to.',
            'price_decreased' => 'Price decreased from :from to :to.',
            'enabled' => 'Service enabled.',
            'disabled' => 'Service disabled.',
            'added' => 'Service added.',
            'deleted' => 'Service deleted.',
        ]
    ],

    'toast' => [
        'added_to_favorites'     => 'Service successfully added to favorites.',
        'removed_from_favorites' => 'Service successfully removed from favorites.',
        'invalid_service_id'     => 'Invalid service ID.',
        'no_services_found'      => 'No services found.',
        'no_categories_found'    => 'No service categories found.',
    ],
];

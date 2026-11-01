<?php

return [
    'description' => [
        'paragraph_1' => 'API (Application Programming Interface) is a set of commands, functions, and protocols that can be used by programmers when building software, thus creating a stable and fast interconnection between systems.',
        'paragraph_2' => 'This API is the path that partners and hosts can use to interact between programs. The API can be used to make requests such as checking account balance, checking service prices, checking transaction status, and creating new transactions.',
        'paragraph_3' => 'API connection requires basic knowledge of computer programming. If you do not understand the documentation we provide, please contact us.',
        'paragraph_4' => 'Here are a few things to consider for API connection:',
        'bullet_1' => 'We wrap all HTTP Responses in <strong>JSON</strong> format.',
        'bullet_2' => 'All HTTP Requests are sent as <strong>POST</strong> Requests.',
        'bullet_3' => 'Please Whitelist your IP in your account settings.',
    ],
    'labels' => [
        'preparation' => 'Preparation',
        'profile' => 'Profile',
        'services' => 'Service List',
        'create_order' => 'Create Order',
        'status_order' => 'Order Status',
        'create_order_refill' => 'Create Order Refill',
        'status_order_refill' => 'Order Refill Status',
        'create_order_cancel' => 'Order Cancellation',
        'endpoint' => 'Endpoint',
        'body_request' => 'Request Body',
        'example_request' => 'Example Request',
        'example_response' => 'Example Response',
        'parameter' => 'Parameter',
        'type' => 'Data Type',
        'required' => 'Required',
        'description' => 'Description',
        'success' => 'Success',
        'fail' => 'Fail',
    ],
    'fields' => [
        'api_key' => [
            'required' => 'Yes',
            'description' => 'API Key configured in API settings',
        ],
        'secret_key' => [
            'required' => 'Yes',
            'description' => 'Secret Key configured in API settings',
        ],
        'is_favorites' => [
            'required' => 'No',
            'description' => 'Fill with <code class="bg-muted rounded px-1 py-0.5 text-destructive">true</code> to display favorite services',
        ],
        'id' => [
            'required' => 'Yes',
            'description' => 'Order ID, separate with a comma (,) for bulk checking',
        ],
        'order_id' => [
            'required' => 'Yes',
            'description' => 'Order ID',
        ],
        'order_refill_id' => [
            'required' => 'Yes',
            'description' => 'Order refill ID',
        ],
        'service_id' => [
            'required' => 'Yes',
            'description' => 'Service ID, see details',
        ],
        'target' => [
            'required' => 'Yes',
            'description' => 'Order target, e.g., username/link/other',
        ],
        'quantity' => [
            'required' => 'Yes',
            'description' => 'Order quantity',
        ],
        'usernames' => [
            'required' => 'Yes',
            'description' => 'List of usernames separated by <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> or <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtags' => [
            'required' => 'Yes',
            'description' => 'List of hashtags separated by <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> or <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtag' => [
            'required' => 'Yes',
            'description' => 'Hashtag to capture/search for usernames',
        ],
        'username' => [
            'required' => 'Yes',
            'description' => 'Username of the comment owner',
        ],
        'media' => [
            'required' => 'Yes',
            'description' => 'Media URL to capture/search for the list of likers',
        ],
        'answer_number' => [
            'required' => 'Yes',
            'description' => 'Answer number from the list of options',
        ],
        'comments' => [
            'required' => 'Yes',
            'description' => 'List of comments separated by <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> or <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
    ],
    'responses' => [
        'total_order_count' => 'Total order amount',
        'total_deposit_count' => 'Total deposit amount',
        'api_key_required' => 'api_key is required.',
        'secret_key_required' => 'secret_key is required.',
        'ip_not_whitelisted' => 'Your IP :ip is not registered in the IP Whitelist.',
        'service_id_required' => 'service_id is required.',
        'service_id_numeric' => 'service_id must be a number.',
        'service_id_invalid' => 'The selected service_id is invalid.',
        'quantity_numeric' => 'quantity must be a number.',
        'quantity_min' => 'minimum quantity value is :min.',
        'insufficient_balance' => 'Insufficient balance.',
        'service_not_available' => 'Service not available.',
        'no_data_found' => 'no orders found.',
        'data_found' => 'orders found.',
        'id_invalid' => 'the selected id is invalid.',
        'order_cannot_be_refilled' => 'order cannot be refilled.',
    ],
];

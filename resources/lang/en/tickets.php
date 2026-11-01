<?php

return [

    'create' => [
        'button' => 'Submit Ticket!',
    ],

    'edit' => [
        'button' => 'Reply Ticket!',
    ],

    'labels' => [
        'department' => 'Department',
        'subject' => 'Subject',
        'data_id' => 'Order/Deposit ID',
        'request' => 'Request',
        'message' => 'Message',
        'ticket_information' => 'Ticket Information',
    ],

    'toast' => [
        'limit_exceeded' => 'You exceeded the ticket creation limit, please wait for the previous ticket to be processed.',
        'create_successful' => 'Ticket with ID <b>:ticket_id</b> successfully created.',
        'reply_successful' => 'Ticket with ID <b>:ticket_id</b> successfully replied.',
    ],

    'log' => [
        'create_successful' => 'Created ticket with ID <b>:ticket_id</b>.',
        'reply_successful' => 'Created ticket reply with ID <b>:ticket_id</b>.',
    ],
];

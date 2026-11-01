<?php

return [
    'title' => 'Ticket',

    'create' => [
        'title'  => 'Send',
        'button' => 'Send Ticket!',
    ],

    'edit' => [
        'title'  => 'Reply',
        'button' => 'Reply Ticket!',
    ],

    'list' => [
        'title' => 'List',
    ],

    'labels' => [
        'department' => 'Departement',
        'subject' => 'Subject',
        'data_id' => 'Orders/Deposits ID',
        'request' => 'Request',
        'message' => 'Message',
        'ticket_information' => 'Informasi Tiket',
    ],

    'toast' => [
        'limit_exceeded' => 'You have exceeded the ticket creation limit. Please wait for the previous ticket to be processed.',
        'create_successful' => 'Ticket with ID <b>:ticket_id</b> created successfully.',
        'reply_successful' => 'Ticket with ID <b>:ticket_id</b> replied successfully.',
    ],

    'log' => [
        'create_successful' => 'Created ticket with ID <b>:ticket_id</b>.',
        'reply_successful' => 'Created ticket reply with ID <b>:ticket_id</b>.',
    ],
];

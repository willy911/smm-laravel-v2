<?php

return [

    'create' => [
        'button' => 'Отправить билет!',
    ],

    'edit' => [
        'button' => 'Ответить на билет!',
    ],

    'labels' => [
        'department' => 'Отдел',
        'subject' => 'Тема',
        'data_id' => 'ID Заказа/Депозита',
        'request' => 'Запрос',
        'message' => 'Сообщение',
        'ticket_information' => 'Информация о билете',
    ],

    'toast' => [
        'limit_exceeded' => 'Вы превысили лимит создания билетов, пожалуйста, подождите, пока предыдущий билет будет обработан.',
        'create_successful' => 'Билет с ID <b>:ticket_id</b> успешно создан.',
        'reply_successful' => 'На билет с ID <b>:ticket_id</b> успешно дан ответ.',
    ],

    'log' => [
        'create_successful' => 'Создан билет с ID <b>:ticket_id</b>.',
        'reply_successful' => 'Создан ответ на билет с ID <b>:ticket_id</b>.',
    ],
];

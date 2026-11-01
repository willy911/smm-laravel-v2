<?php

return [
    'description' => [
        'paragraph_1' => 'API (Application Programming Interface) — это набор команд, функций и протоколов, которые программисты могут использовать при создании программного обеспечения, что обеспечивает стабильное и быстрое взаимодействие между системами.',
        'paragraph_2' => 'Этот API — путь, который могут использовать партнеры и хосты для взаимодействия между программами. API можно использовать для выполнения запросов, таких как проверка баланса аккаунта, проверка цен на услуги, проверка статуса транзакций и создание новых транзакций.',
        'paragraph_3' => 'Для подключения к API требуются базовые знания в области компьютерного программирования. Если вы не понимаете предоставленную нами документацию, пожалуйста, свяжитесь с нами.',
        'paragraph_4' => 'Вот несколько моментов, на которые следует обратить внимание при подключении к API:',
        'bullet_1' => 'Мы оборачиваем все HTTP-ответы в формате <strong>JSON</strong>.',
        'bullet_2' => 'Все HTTP-запросы отправляются как <strong>POST</strong>-запросы.',
        'bullet_3' => 'Пожалуйста, добавьте свой IP в белый список в настройках вашего аккаунта.',
    ],
    'labels' => [
        'preparation' => 'Подготовка',
        'profile' => 'Профиль',
        'services' => 'Список услуг',
        'create_order' => 'Создать заказ',
        'status_order' => 'Статус заказа',
        'create_order_refill' => 'Создать пополнение заказа',
        'status_order_refill' => 'Статус пополнения заказа',
        'create_order_cancel' => 'Отмена заказа',
        'endpoint' => 'Конечная точка',
        'body_request' => 'Тело запроса',
        'example_request' => 'Пример запроса',
        'example_response' => 'Пример ответа',
        'parameter' => 'Параметр',
        'type' => 'Тип данных',
        'required' => 'Обязательный',
        'description' => 'Описание',
        'success' => 'Успех',
        'fail' => 'Сбой',
    ],
    'fields' => [
        'api_key' => [
            'required' => 'Да',
            'description' => 'API Ключ, установленный в настройках API',
        ],
        'secret_key' => [
            'required' => 'Да',
            'description' => 'Секретный ключ, установленный в настройках API',
        ],
        'is_favorites' => [
            'required' => 'Нет',
            'description' => 'Заполните <code class="bg-muted rounded px-1 py-0.5 text-destructive">true</code> для отображения избранных услуг',
        ],
        'id' => [
            'required' => 'Да',
            'description' => 'ID заказа, разделите запятой (,) для массовой проверки',
        ],
        'order_id' => [
            'required' => 'Да',
            'description' => 'ID заказа',
        ],
        'order_refill_id' => [
            'required' => 'Да',
            'description' => 'ID пополнения заказа',
        ],
        'service_id' => [
            'required' => 'Да',
            'description' => 'ID Услуги, см. подробнее',
        ],
        'target' => [
            'required' => 'Да',
            'description' => 'Цель заказа, например, имя пользователя/ссылка/другое',
        ],
        'quantity' => [
            'required' => 'Да',
            'description' => 'Количество заказа',
        ],
        'usernames' => [
            'required' => 'Да',
            'description' => 'Список имен пользователей, разделенных <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> или <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtags' => [
            'required' => 'Да',
            'description' => 'Список хэштегов, разделенных <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> или <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtag' => [
            'required' => 'Да',
            'description' => 'Хэштег для захвата/поиска имен пользователей',
        ],
        'username' => [
            'required' => 'Да',
            'description' => 'Имя пользователя владельца комментария',
        ],
        'media' => [
            'required' => 'Да',
            'description' => 'URL медиа для захвата/поиска списка лайков',
        ],
        'answer_number' => [
            'required' => 'Да',
            'description' => 'Номер ответа из списка выбора',
        ],
        'comments' => [
            'required' => 'Да',
            'description' => 'Список комментариев, разделенных <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> или <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
    ],
    'responses' => [
        'total_order_count' => 'Общее количество заказов',
        'total_deposit_count' => 'Общее количество депозитов',
        'api_key_required' => 'api_key является обязательным.',
        'secret_key_required' => 'secret_key является обязательным.',
        'ip_not_whitelisted' => 'Ваш IP :ip не зарегистрирован в белом списке IP.',
        'service_id_required' => 'service_id является обязательным.',
        'service_id_numeric' => 'service_id должен быть числом.',
        'service_id_invalid' => 'Выбранный service_id недействителен.',
        'quantity_numeric' => 'quantity должен быть числом.',
        'quantity_min' => 'Минимальное значение quantity — :min.',
        'insufficient_balance' => 'Ваш баланс недостаточен.',
        'service_not_available' => 'Услуга недоступна.',
        'no_data_found' => 'заказы не найдены.',
        'data_found' => 'заказы найдены.',
        'id_invalid' => 'Выбранный id недействителен.',
        'order_cannot_be_refilled' => 'заказ не может быть пополнен.',
    ],
];

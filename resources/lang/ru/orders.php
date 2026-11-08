<?php

return [
    'create' => [
        'button' => 'Создать заказ!',
    ],

    'labels' => [
        'average_time_and_quantity' => '<span class="font-medium text-green-600">:time</span> со средним количеством заказов <span class="font-medium text-green-600">:quantity</span>',
        'view_order_target_example' => 'Посмотреть пример цели заказа',
        'order_target_example' => 'Пример цели заказа',
    ],

    'toast' => [
        'refill_successful' => 'Запрос на пополнение заказа успешно создан.',
        'cancel_successful' => 'Запрос на отмену заказа успешно создан.',
        'cancel_failed' => 'The cancellation request for order ID :order_id failed to be processed by the provider. Please try again later or contact support.',
        'refill_failed' => 'The refill request for order ID :order_id failed to be processed by the provider. Please try again later or contact support.',
        'invalid_order_id' => 'Недействительный ID заказа.',
        'wait_previous_order' => 'Пожалуйста, дождитесь, пока предыдущий заказ будет обработан.',
        'min_quantity' => 'Минимальное количество: :min.',
        'max_quantity' => 'Максимальное количество: :max.',
        'mass_order_not_supported' => 'Эта услуга не поддерживает массовые заказы.',
        'order_created_with_target' => 'Заказ с ID <strong>:order_id</strong> = Цель <strong>:order_target</strong> успешно создан.',
        'service_not_available' => 'Услуга недоступна.',
        'order_created' => 'Заказ успешно создан.',
        'insufficient_balance' => 'Ваш баланс недостаточен, пополните сейчас!',
    ],

    'log' => [
        'create_successful' => 'Создан заказ с ID <b>:order_id</b>.',
        'create_api_successful' => 'Создан заказ (API) с ID <b>:order_id</b>.',
        'create_single_successful' => 'Создан заказ (Веб - Единичный) с ID <b>:order_id</b>.',
        'create_mass_successful' => 'Создан заказ (Веб - Массовый) с ID <b>:order_id</b>.',
        'refill_successful' => 'Создано пополнение заказа с ID <b>:order_refill_id</b>.',
        'cancel_successful' => 'Создана отмена заказа с ID <b>:order_cancel_id</b>.',
        'refund_successful' => 'Возврат средств по заказу с ID <b>:order_id</b> выполнен успешно.',
    ],
];

<?php

return [
    'create' => [
        'button' => 'Sipariş Oluştur!',
    ],

    'labels' => [
        'average_time_and_quantity' => 'Ortalama sipariş miktarı <span class="font-medium text-green-600">:quantity</span> olan <span class="font-medium text-green-600">:time</span>',
        'view_order_target_example' => 'Sipariş Hedef Örneğini Görüntüle',
        'order_target_example' => 'Sipariş Hedefi Örneği',
    ],

    'toast' => [
        'refill_successful' => 'Sipariş dolum isteği başarıyla oluşturuldu.',
        'cancel_successful' => 'Sipariş iptal isteği başarıyla oluşturuldu.',
        'cancel_failed' => 'The cancellation request for order ID :order_id failed to be processed by the provider. Please try again later or contact support.',
        'refill_failed' => 'The refill request for order ID :order_id failed to be processed by the provider. Please try again later or contact support.',
        'invalid_order_id' => 'Geçersiz Sipariş ID\'si.',
        'wait_previous_order' => 'Lütfen önceki siparişin önce işlenmesini bekleyin.',
        'min_quantity' => 'Minimum miktar :min.',
        'max_quantity' => 'Maksimum miktar :max.',
        'mass_order_not_supported' => 'Bu hizmet toplu siparişi desteklemiyor.',
        'order_created_with_target' => '<strong>:order_id</strong> ID\'li sipariş = Hedef <strong>:order_target</strong> başarıyla oluşturuldu.',
        'service_not_available' => 'Hizmet mevcut değil.',
        'order_created' => 'Sipariş başarıyla oluşturuldu.',
        'insufficient_balance' => 'Bakiyeniz yetersiz, Şimdi Para Yatırın!',
    ],

    'log' => [
        'create_successful' => '<b>:order_id</b> ID\'li Sipariş oluşturuluyor.',
        'create_api_successful' => '<b>:order_id</b> ID\'li Sipariş (API) oluşturuluyor.',
        'create_single_successful' => '<b>:order_id</b> ID\'li Sipariş (Web - Tekil) oluşturuluyor.',
        'create_mass_successful' => '<b>:order_id</b> ID\'li Sipariş (Web - Toplu) oluşturuluyor.',
        'refill_successful' => '<b>:order_refill_id</b> ID\'li Sipariş Doldurma oluşturuluyor.',
        'cancel_successful' => '<b>:order_cancel_id</b> ID\'li Sipariş İptali oluşturuluyor.',
        'refund_successful' => 'ID <b>:order_id</b> olan sipariş için geri ödeme başarıyla tamamlandı.',
    ],
];

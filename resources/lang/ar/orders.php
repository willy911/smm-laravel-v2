<?php

return [
    'create' => [
        'button' => 'إنشاء طلب!',
    ],

    'labels' => [
        'average_time_and_quantity' => '<span class="font-medium text-green-600">:time</span> بمتوسط كمية الطلب <span class="font-medium text-green-600">:quantity</span>',
        'view_order_target_example' => 'عرض مثال على هدف الطلب',
        'order_target_example' => 'مثال على هدف الطلب',

    ],

    'toast' => [
        'refill_successful'    => 'تم إنشاء طلب إعادة تعبئة الطلب بنجاح.',
        'cancel_successful'    => 'تم إنشاء طلب إلغاء الطلب بنجاح.',
        'invalid_order_id'     => 'رقم الطلب غير صالح.',
        'wait_previous_order' => 'يرجى انتظار معالجة الطلب السابق أولاً.',
        'min_quantity' => 'الحد الأدنى للكمية هو :min.',
        'max_quantity' => 'الحد الأقصى للكمية هو :max.',
        'mass_order_not_supported' => 'هذه الخدمة لا تدعم الطلبات الجماعية.',
        'order_created_with_target' => 'تم إنشاء الطلب برقم <strong>:order_id</strong> = الهدف <strong>:order_target</strong> بنجاح.',
        'service_not_available'     => 'الخدمة غير متاحة.',
        'order_created' => 'تم إنشاء الطلب بنجاح.',
        'insufficient_balance' => 'رصيدك غير كافٍ، قم بالإيداع الآن!',
    ],

    'log' => [
        'create_successful'         => 'إنشاء طلب برقم <b>:order_id</b>.',
        'create_api_successful'     => 'إنشاء طلب (API) برقم <b>:order_id</b>.',
        'create_single_successful'  => 'إنشاء طلب (ويب - فردي) برقم <b>:order_id</b>.',
        'create_mass_successful'    => 'إنشاء طلب (ويب - جماعي) برقم <b>:order_id</b>.',
        'refill_successful' => 'إنشاء إعادة تعبئة الطلب برقم <b>:order_refill_id</b>.',
        'cancel_successful'     => 'إنشاء إلغاء الطلب برقم <b>:order_cancel_id</b>.',
        'refund_successful' => 'تم استرداد المبلغ للطلب برقم <b>:order_id</b> بنجاح.',
    ],
];

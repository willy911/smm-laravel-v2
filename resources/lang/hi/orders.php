<?php

return [
    'create' => [
        'button' => 'ऑर्डर बनाएं!',
    ],

    'labels' => [
        'average_time_and_quantity' => '<span class="font-medium text-green-600">:time</span> औसत ऑर्डर मात्रा <span class="font-medium text-green-600">:quantity</span> के साथ',
        'view_order_target_example' => 'ऑर्डर लक्ष्य का उदाहरण देखें',
        'order_target_example' => 'ऑर्डर लक्ष्य का उदाहरण',
    ],

    'toast' => [
        'refill_successful' => 'ऑर्डर रिफिल अनुरोध सफलतापूर्वक बनाया गया।',
        'cancel_successful' => 'ऑर्डर रद्द करने का अनुरोध सफलतापूर्वक बनाया गया।',
        'invalid_order_id' => 'ऑर्डर ID अमान्य है।',
        'wait_previous_order' => 'कृपया पिछले ऑर्डर के पहले संसाधित होने तक प्रतीक्षा करें।',
        'min_quantity' => 'न्यूनतम मात्रा :min है।',
        'max_quantity' => 'अधिकतम मात्रा :max है।',
        'mass_order_not_supported' => 'यह सेवा सामूहिक ऑर्डर का समर्थन नहीं करती है।',
        'order_created_with_target' => 'ऑर्डर ID <strong>:order_id</strong> = लक्ष्य <strong>:order_target</strong> के साथ सफलतापूर्वक बनाया गया।',
        'service_not_available' => 'सेवा उपलब्ध नहीं है।',
        'order_created' => 'ऑर्डर सफलतापूर्वक बनाया गया।',
        'insufficient_balance' => 'आपका बैलेंस अपर्याप्त है, अभी जमा करें!',
    ],

    'log' => [
        'create_successful' => 'ID <b>:order_id</b> के साथ ऑर्डर बनाया जा रहा है।',
        'create_api_successful' => 'ID <b>:order_id</b> के साथ ऑर्डर (API) बनाया जा रहा है।',
        'create_single_successful' => 'ID <b>:order_id</b> के साथ ऑर्डर (वेब - एकल) बनाया जा रहा है।',
        'create_mass_successful' => 'ID <b>:order_id</b> के साथ ऑर्डर (वेब - सामूहिक) बनाया जा रहा है।',
        'refill_successful' => 'ID <b>:order_refill_id</b> के साथ ऑर्डर रिफिल बनाया जा रहा है।',
        'cancel_successful' => 'ID <b>:order_cancel_id</b> के साथ ऑर्डर रद्द करना बनाया जा रहा है।',
        'refund_successful' => 'ऑर्डर आईडी <b>:order_id</b> के लिए रिफंड सफलतापूर्वक किया गया है।',
    ],
];

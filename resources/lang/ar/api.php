<?php

return [
    'description' => [
        'paragraph_1' => 'API (واجهة برمجة التطبيقات) هي مجموعة من الأوامر والوظائف والبروتوكولات التي يمكن للمبرمجين استخدامها عند بناء البرمجيات، مما يخلق اتصالاً مستقراً وسريعاً بين الأنظمة.',
        'paragraph_2' => 'هذا API هو المسار الذي يمكن للشركاء أو المضيفين استخدامه للتفاعل بين البرامج. يمكن استخدام API لإجراء طلبات مثل فحص رصيد الحساب، فحص أسعار الخدمات، فحص حالة المعاملة، وإنشاء معاملة جديدة.',
        'paragraph_3' => 'يتطلب اتصال API هذا معرفة أساسية ببرمجة الكمبيوتر. إذا لم تفهم الوثائق التي نقدمها، يرجى الاتصال بنا.',
        'paragraph_4' => 'هناك عدة أشياء يجب مراعاتها لاتصال API، بما في ذلك:',
        'bullet_1' => 'نحن نغلف جميع استجابات HTTP بتنسيق <strong>JSON</strong>.',
        'bullet_2' => 'يتم إرسال جميع طلبات HTTP كطلبات <strong>POST</strong>.',
        'bullet_3' => 'يرجى إضافة IP إلى القائمة البيضاء في إعدادات حسابك.',
    ],
    'labels' => [
        'preparation' => 'التحضير',
        'profile' => 'الملف الشخصي',
        'services' => 'قائمة الخدمات',
        'create_order' => 'إنشاء طلب',
        'status_order' => 'حالة الطلب',
        'create_order_refill' => 'إنشاء إعادة تعبئة الطلب',
        'status_order_refill' => 'حالة إعادة تعبئة الطلب',
        'create_order_cancel' => 'إلغاء الطلب',
        'endpoint' => 'نقطة النهاية',
        'body_request' => 'نص الطلب',
        'example_request' => 'مثال على الطلب',
        'example_response' => 'مثال على الاستجابة',
        'parameter' => 'المعامل',
        'type'      => 'نوع البيانات',
        'required'  => 'مطلوب',
        'description' => 'الوصف',
        'success' => 'نجح',
        'fail' => 'فشل',
    ],
    'fields' => [
        'api_key' => [
            'required' => 'نعم',
            'description' => 'مفتاح API الذي تم تعيينه في إعدادات API',
        ],
        'secret_key' => [
            'required' => 'نعم',
            'description' => 'المفتاح السري الذي تم تعيينه في إعدادات API',
        ],
        'is_favorites' => [
            'required' => 'لا',
            'description' => 'املأ بـ <code class="bg-muted rounded px-1 py-0.5 text-destructive">true</code> لعرض الخدمات المفضلة',
        ],
        'id' => [
            'required' => 'نعم',
            'description' => 'رقم الطلب، افصل بفاصلة (،) للفحص الجماعي',
        ],
        'order_id' => [
            'required' => 'نعم',
            'description' => 'رقم الطلب',
        ],
        'order_refill_id' => [
            'required' => 'نعم',
            'description' => 'رقم إعادة تعبئة الطلب',
        ],
        'service_id' => [
            'required' => 'نعم',
            'description' => 'رقم الخدمة، انظر المزيد',
        ],
        'target' => [
            'required' => 'نعم',
            'description' => 'هدف الطلب، مثل اسم المستخدم/الرابط/أخرى',
        ],
        'quantity' => [
            'required' => 'نعم',
            'description' => 'كمية الطلب',
        ],
        'usernames' => [
            'required' => 'نعم',
            'description' => 'قائمة أسماء المستخدمين مفصولة بـ <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> أو <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtags' => [
            'required' => 'نعم',
            'description' => 'قائمة الهاشتاغات مفصولة بـ <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> أو <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtag' => [
            'required' => 'نعم',
            'description' => 'الهاشتاغ لالتقاط/البحث عن اسم المستخدم',
        ],
        'username' => [
            'required' => 'نعم',
            'description' => 'اسم مستخدم صاحب التعليق',
        ],
        'media' => [
            'required' => 'نعم',
            'description' => 'رابط الوسائط لالتقاط/البحث عن قائمة المعجبين',
        ],
        'answer_number' => [
            'required' => 'نعم',
            'description' => 'رقم الإجابة من قائمة الخيارات',
        ],
        'comments' => [
            'required' => 'نعم',
            'description' => 'قائمة التعليقات مفصولة بـ <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> أو <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
    ],
    'responses' => [
        'total_order_count'   => 'إجمالي عدد الطلبات',
        'total_deposit_count' => 'إجمالي عدد الإيداعات',
        'api_key_required'     => 'api_key مطلوب.',
        'secret_key_required'  => 'secret_key مطلوب.',
        'ip_not_whitelisted'   => 'IP الخاص بك :ip غير مسجل في القائمة البيضاء.',
        'service_id_required'       => 'service_id مطلوب.',
        'service_id_numeric'        => 'service_id يجب أن يكون رقماً.',
        'service_id_invalid'        => 'service_id المحدد غير صالح.',
        'quantity_numeric'          => 'quantity يجب أن يكون رقماً.',
        'quantity_min'              => 'quantity يجب أن يكون على الأقل :min.',
        'insufficient_balance'      => 'رصيدك غير كافٍ.',
        'service_not_available'     => 'الخدمة غير متاحة.',
        'no_data_found'  => 'لم يتم العثور على طلبات.',
        'data_found'  => 'تم العثور على طلبات.',
        'id_invalid' => 'المعرف المحدد غير صالح.',
        'order_cannot_be_refilled' => 'لا يمكن إعادة تعبئة الطلب.',
    ],
];

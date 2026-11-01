<?php

return [
    'description' => [
        'paragraph_1' => 'एपीआई (एप्लिकेशन प्रोग्रामिंग इंटरफ़ेस) कमांड, फ़ंक्शंस और प्रोटोकॉल का एक समूह है जिसका उपयोग प्रोग्रामर सॉफ्टवेयर बनाते समय कर सकते हैं, जिससे सिस्टम के बीच एक स्थिर और तेज़ इंटरकनेक्शन बनता है।',
        'paragraph_2' => 'यह एपीआई एक ऐसा मार्ग है जिसका उपयोग पार्टनर और होस्ट प्रोग्राम के बीच इंटरैक्ट करने के लिए कर सकते हैं। एपीआई का उपयोग खाता शेष (अकाउंट बैलेंस) की जांच, सेवा की कीमत की जांच, लेनदेन की स्थिति की जांच और एक नया लेनदेन बनाने जैसे अनुरोधों को करने के लिए किया जा सकता है।',
        'paragraph_3' => 'इस एपीआई कनेक्शन के लिए कंप्यूटर प्रोग्रामिंग के बुनियादी ज्ञान की आवश्यकता होती है। यदि आप हमारे द्वारा प्रदान किए गए दस्तावेज़ों को नहीं समझते हैं, तो कृपया हमसे संपर्क करें।',
        'paragraph_4' => 'एपीआई कनेक्शन के लिए कुछ बातों पर ध्यान देना आवश्यक है, जिनमें शामिल हैं:',
        'bullet_1' => 'हम सभी HTTP Response को <strong>JSON</strong> फॉर्मेट में रैप करते हैं।',
        'bullet_2' => 'सभी HTTP Request को <strong>POST</strong> Request के रूप में भेजा जाता है।',
        'bullet_3' => 'कृपया अपने अकाउंट सेटिंग्स में आईपी को Whitelist (श्वेतसूचीबद्ध) करें।',
    ],
    'labels' => [
        'preparation' => 'तैयारी',
        'profile' => 'प्रोफ़ाइल',
        'services' => 'सेवाओं की सूची',
        'create_order' => 'ऑर्डर बनाएं',
        'status_order' => 'ऑर्डर की स्थिति',
        'create_order_refill' => 'ऑर्डर रीफिल बनाएं',
        'status_order_refill' => 'ऑर्डर रीफिल की स्थिति',
        'create_order_cancel' => 'ऑर्डर रद्द करना',
        'endpoint' => 'एंडपॉइंट',
        'body_request' => 'बॉडी रिक्वेस्ट (अनुरोध का मुख्य भाग)',
        'example_request' => 'अनुरोध का उदाहरण',
        'example_response' => 'Response का उदाहरण',
        'parameter' => 'पैरामीटर',
        'type'      => 'डेटा टाइप (डेटा का प्रकार)',
        'required'  => 'आवश्यक',
        'description' => 'विवरण',
        'success' => 'सफलता',
        'fail' => 'विफलता',
    ],
    'fields' => [
        'api_key' => [
            'required' => 'हाँ',
            'description' => 'एपीआई सेटिंग में सेट की गई एपीआई कुंजी (API Key)',
        ],
        'secret_key' => [
            'required' => 'हाँ',
            'description' => 'एपीआई सेटिंग में सेट की गई Secret Key',
        ],
        'is_favorites' => [
            'required' => 'नहीं',
            'description' => 'पसंदीदा सेवाओं को प्रदर्शित करने के लिए <code class="bg-muted rounded px-1 py-0.5 text-destructive">true</code> से भरें',
        ],
        'id' => [
            'required' => 'हाँ',
            'description' => 'ऑर्डर आईडी, थोक जांच के लिए अल्पविराम (,) से अलग करें',
        ],
        'order_id' => [
            'required' => 'हाँ',
            'description' => 'ऑर्डर आईडी',
        ],
        'order_refill_id' => [
            'required' => 'हाँ',
            'description' => 'ऑर्डर रीफिल आईडी',
        ],
        'service_id' => [
            'required' => 'हाँ',
            'description' => 'सेवा आईडी, अधिक देखें',
        ],
        'target' => [
            'required' => 'हाँ',
            'description' => 'ऑर्डर का लक्ष्य, जैसे उपयोगकर्ता नाम/लिंक/अन्य',
        ],
        'quantity' => [
            'required' => 'हाँ',
            'description' => 'ऑर्डर की मात्रा',
        ],
        'usernames' => [
            'required' => 'हाँ',
            'description' => 'उपयोगकर्ता नामों की सूची <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> या <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code> से अलग की गई',
        ],
        'hashtags' => [
            'required' => 'हाँ',
            'description' => 'हैशटैग की सूची <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> या <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code> से अलग की गई',
        ],
        'hashtag' => [
            'required' => 'हाँ',
            'description' => 'उपयोगकर्ता नाम को कैप्चर/खोजने के लिए हैशटैग',
        ],
        'username' => [
            'required' => 'हाँ',
            'description' => 'टिप्पणी मालिक का उपयोगकर्ता नाम',
        ],
        'media' => [
            'required' => 'हाँ',
            'description' => 'पसंद करने वालों की सूची को कैप्चर/खोजने के लिए मीडिया यूआरएल',
        ],
        'answer_number' => [
            'required' => 'हाँ',
            'description' => 'विकल्पों की सूची में से उत्तर संख्या',
        ],
        'comments' => [
            'required' => 'हाँ',
            'description' => 'टिप्पणियों की सूची <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> या <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code> से अलग की गई',
        ],
    ],
    'responses' => [
        'total_order_count'   => 'ऑर्डर की कुल संख्या',
        'total_deposit_count' => 'जमा (डिपॉजिट) की कुल संख्या',
        'api_key_required'     => 'api_key आवश्यक है।',
        'secret_key_required'  => 'secret_key आवश्यक है।',
        'ip_not_whitelisted'   => 'आपका आईपी :ip Whitelist (श्वेतसूची) में पंजीकृत नहीं है।',
        'service_id_required'       => 'service_id आवश्यक है।',
        'service_id_numeric'        => 'service_id संख्यात्मक होना चाहिए।',
        'service_id_invalid'        => 'चयनित service_id अमान्य है।',
        'quantity_numeric'          => 'quantity संख्यात्मक होना चाहिए।',
        'quantity_min'              => 'quantity का न्यूनतम मान :min होना चाहिए।',
        'insufficient_balance'      => 'आपका बैलेंस अपर्याप्त है।',
        'service_not_available'     => 'सेवा उपलब्ध नहीं है।',
        'no_data_found'  => 'कोई ऑर्डर नहीं मिला।',
        'data_found'  => 'ऑर्डर मिला।',
        'id_invalid' => 'चयनित आईडी अमान्य है।',
        'order_cannot_be_refilled' => 'ऑर्डर को रीफिल नहीं किया जा सकता।',
    ],
];

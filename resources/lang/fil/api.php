<?php

return [
    'description' => [
        'paragraph_1' => 'Ang API (Application Programming Interface) ay isang koleksyon ng mga utos, function, at protocol na maaaring gamitin ng mga programmer sa pagbuo ng software, upang makalikha ng matatag at mabilis na koneksyon sa pagitan ng mga sistema.',
        'paragraph_2' => 'Ang API na ito ay isang daanan na maaaring gamitin ng mga partner at host upang makipag-ugnayan sa pagitan ng mga programa. Maaari itong gamitin upang magsagawa ng mga request tulad ng pag-check ng balanse ng account, pag-check ng presyo ng serbisyo, pag-check ng status ng transaksyon, at paggawa ng bagong transaksyon.',
        'paragraph_3' => 'Ang koneksyon sa API na ito ay nangangailangan ng pangunahing kaalaman sa computer programming. Kung hindi mo nauunawaan ang dokumentasyong aming ibinigay, mangyaring makipag-ugnayan sa amin.',
        'paragraph_4' => 'Narito ang ilang mahahalagang bagay na dapat isaalang-alang para sa koneksyon ng API:',
        'bullet_1' => 'Ibinabalot namin ang lahat ng HTTP Response sa format na <strong>JSON</strong>.',
        'bullet_2' => 'Lahat ng HTTP Request ay ipinapadala bilang <strong>POST</strong> Request.',
        'bullet_3' => 'Mangyaring i-whitelist ang IP sa mga setting ng iyong account.',
    ],
    'labels' => [
        'preparation' => 'Paghahanda',
        'profile' => 'Profile',
        'services' => 'Listahan ng mga Serbisyo',
        'create_order' => 'Gumawa ng Order',
        'status_order' => 'Status ng Order',
        'create_order_refill' => 'Gumawa ng Refill ng Order',
        'status_order_refill' => 'Status ng Refill ng Order',
        'create_order_cancel' => 'Pagkansela ng Order',
        'endpoint' => 'Endpoint',
        'body_request' => 'Body Request',
        'example_request' => 'Halimbawa ng Request',
        'example_response' => 'Halimbawa ng Response',
        'parameter' => 'Parameter',
        'type'      => 'Uri ng Data',
        'required'  => 'Kinakailangan',
        'description' => 'Paglalarawan',
        'success' => 'Tagumpay',
        'fail' => 'Nabigo',
    ],
    'fields' => [
        'api_key' => [
            'required' => 'Oo',
            'description' => 'API Key na itinakda sa mga setting ng API',
        ],
        'secret_key' => [
            'required' => 'Oo',
            'description' => 'Secret Key na itinakda sa mga setting ng API',
        ],
        'is_favorites' => [
            'required' => 'Hindi',
            'description' => 'Ilagay ang <code class="bg-muted rounded px-1 py-0.5 text-destructive">true</code> upang ipakita ang mga paboritong serbisyo',
        ],
        'id' => [
            'required' => 'Oo',
            'description' => 'Order ID, paghiwalayin gamit ang kuwit (,) para sa maramihang pag-check',
        ],
        'order_id' => [
            'required' => 'Oo',
            'description' => 'Order ID',
        ],
        'order_refill_id' => [
            'required' => 'Oo',
            'description' => 'Order Refill ID',
        ],
        'service_id' => [
            'required' => 'Oo',
            'description' => 'Service ID, tingnan ang detalye',
        ],
        'target' => [
            'required' => 'Oo',
            'description' => 'Target ng order, tulad ng username/link/iba pa',
        ],
        'quantity' => [
            'required' => 'Oo',
            'description' => 'Dami ng order',
        ],
        'usernames' => [
            'required' => 'Oo',
            'description' => 'Listahan ng mga username na pinaghihiwalay ng <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> o <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtags' => [
            'required' => 'Oo',
            'description' => 'Listahan ng mga hashtag na pinaghihiwalay ng <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> o <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtag' => [
            'required' => 'Oo',
            'description' => 'Hashtag para sa pagkuha/paghahanap ng username',
        ],
        'username' => [
            'required' => 'Oo',
            'description' => 'Username ng may-ari ng komento',
        ],
        'media' => [
            'required' => 'Oo',
            'description' => 'Media URL para sa pagkuha/paghahanap ng listahan ng mga nag-like',
        ],
        'answer_number' => [
            'required' => 'Oo',
            'description' => 'Numero ng sagot mula sa listahan ng mga pagpipilian',
        ],
        'comments' => [
            'required' => 'Oo',
            'description' => 'Listahan ng mga komento na pinaghihiwalay ng <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> o <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
    ],
    'responses' => [
        'total_order_count'   => 'Kabuuang bilang ng mga order',
        'total_deposit_count' => 'Kabuuang bilang ng mga deposit',
        'api_key_required'     => 'Kinakailangan ang api_key.',
        'secret_key_required'  => 'Kinakailangan ang secret_key.',
        'ip_not_whitelisted'   => 'Ang iyong IP :ip ay hindi nakalista sa IP Whitelist.',
        'service_id_required'       => 'Kinakailangan ang service_id.',
        'service_id_numeric'        => 'Ang service_id ay dapat isang numero.',
        'service_id_invalid'        => 'Ang napiling service_id ay hindi wasto.',
        'quantity_numeric'          => 'Ang quantity ay dapat isang numero.',
        'quantity_min'              => 'Ang minimum na halaga ng quantity ay :min.',
        'insufficient_balance'      => 'Hindi sapat ang iyong balanse.',
        'service_not_available'     => 'Hindi available ang serbisyo.',
        'no_data_found'  => 'Walang nahanap na mga order.',
        'data_found'  => 'May nahanap na mga order.',
        'id_invalid' => 'Ang napiling id ay hindi wasto.',
        'order_cannot_be_refilled' => 'Hindi maaaring i-refill ang order.',
    ],
];

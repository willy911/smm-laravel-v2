<?php

return [
    'description' => [
        'paragraph_1' => 'API (Uygulama Programlama Arayüzü), programcıların yazılım oluştururken kullanabileceği bir dizi komut, işlev ve protokoldür, bu da sistemler arasında istikrarlı ve hızlı bir ara bağlantı sağlar.',
        'paragraph_2' => 'Bu API, ortakların ve sunucuların programlar arasında etkileşim kurmak için kullanabileceği bir kanaldır. API, hesap bakiyesi kontrolü, hizmet fiyatı kontrolü, işlem durumu kontrolü ve yeni işlem oluşturma gibi istekler yapmak için kullanılabilir.',
        'paragraph_3' => 'Bu API bağlantısı, temel bilgisayar programlama bilgisi gerektirir. Sağladığımız belgeleri anlamadıysanız, lütfen bizimle iletişime geçin.',
        'paragraph_4' => 'API bağlantısı için dikkat edilmesi gereken bazı hususlar şunlardır:',
        'bullet_1' => 'Tüm HTTP Yanıtlarını <strong>JSON</strong> formatında sarmalıyoruz.',
        'bullet_2' => 'Tüm HTTP İstekleri <strong>POST</strong> İsteği olarak gönderilir.',
        'bullet_3' => 'Lütfen IP Beyaz Listesini hesap ayarlarınızda yapın.',
    ],
    'labels' => [
        'preparation' => 'Hazırlık',
        'profile' => 'Profil',
        'services' => 'Hizmet Listesi',
        'create_order' => 'Sipariş Oluştur',
        'status_order' => 'Sipariş Durumu',
        'create_order_refill' => 'Sipariş Dolumu Oluştur',
        'status_order_refill' => 'Sipariş Dolum Durumu',
        'create_order_cancel' => 'Sipariş İptali',
        'endpoint' => 'Uç Nokta (Endpoint)',
        'body_request' => 'İstek Gövdesi (Body Request)',
        'example_request' => 'Örnek İstek',
        'example_response' => 'Örnek Yanıt',
        'parameter' => 'Parametre',
        'type' => 'Veri Tipi',
        'required' => 'Gerekli',
        'description' => 'Açıklama',
        'success' => 'Başarılı',
        'fail' => 'Başarısız',
    ],
    'fields' => [
        'api_key' => [
            'required' => 'Evet',
            'description' => 'API ayarlarında yapılandırılmış API Anahtarı',
        ],
        'secret_key' => [
            'required' => 'Evet',
            'description' => 'API ayarlarında yapılandırılmış Gizli Anahtar',
        ],
        'is_favorites' => [
            'required' => 'Hayır',
            'description' => 'Favori hizmetleri göstermek için <code class="bg-muted rounded px-1 py-0.5 text-destructive">true</code> ile doldurun',
        ],
        'id' => [
            'required' => 'Evet',
            'description' => 'Sipariş ID\'si, toplu kontrol için virgül (,) ile ayırın',
        ],
        'order_id' => [
            'required' => 'Evet',
            'description' => 'Sipariş ID\'si',
        ],
        'order_refill_id' => [
            'required' => 'Evet',
            'description' => 'Sipariş dolum ID\'si',
        ],
        'service_id' => [
            'required' => 'Evet',
            'description' => 'Hizmet ID\'si, daha fazla bilgi için bakınız',
        ],
        'target' => [
            'required' => 'Evet',
            'description' => 'Sipariş hedefi, kullanıcı adı/bağlantı/diğerleri',
        ],
        'quantity' => [
            'required' => 'Evet',
            'description' => 'Sipariş miktarı',
        ],
        'usernames' => [
            'required' => 'Evet',
            'description' => 'Kullanıcı adı listesi <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> veya <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code> ile ayrılmış',
        ],
        'hashtags' => [
            'required' => 'Evet',
            'description' => 'Etiket listesi <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> veya <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code> ile ayrılmış',
        ],
        'hashtag' => [
            'required' => 'Evet',
            'description' => 'Kullanıcı adlarını yakalamak/aramak için Etiket',
        ],
        'username' => [
            'required' => 'Evet',
            'description' => 'Yorum sahibinin kullanıcı adı',
        ],
        'media' => [
            'required' => 'Evet',
            'description' => 'Beğenenler listesini yakalamak/aramak için Medya URL\'si',
        ],
        'answer_number' => [
            'required' => 'Evet',
            'description' => 'Seçenek listesinden cevap numarası',
        ],
        'comments' => [
            'required' => 'Evet',
            'description' => 'Yorum listesi <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> veya <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code> ile ayrılmış',
        ],
    ],
    'responses' => [
        'total_order_count' => 'Toplam sipariş sayısı',
        'total_deposit_count' => 'Toplam para yatırma sayısı',
        'api_key_required' => 'api_key gereklidir.',
        'secret_key_required' => 'secret_key gereklidir.',
        'ip_not_whitelisted' => 'IP adresiniz :ip Beyaz Liste IP\'sinde kayıtlı değil.',
        'service_id_required' => 'service_id gereklidir.',
        'service_id_numeric' => 'service_id bir sayı olmalıdır.',
        'service_id_invalid' => 'Seçilen service_id geçersiz.',
        'quantity_numeric' => 'quantity bir sayı olmalıdır.',
        'quantity_min' => 'quantity en az :min değerinde olmalıdır.',
        'insufficient_balance' => 'Bakiyeniz yetersiz.',
        'service_not_available' => 'Hizmet mevcut değil.',
        'no_data_found' => 'sipariş bulunamadı.',
        'data_found' => 'sipariş bulundu.',
        'id_invalid' => 'seçilen id geçersiz.',
        'order_cannot_be_refilled' => 'sipariş doldurulamaz.',
    ],
];

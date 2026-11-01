<?php

return [
    'description' => [
        'paragraph_1' => 'API (Application Programming Interface) ist eine Sammlung von Befehlen, Funktionen und Protokollen, die von Programmierern beim Erstellen von Software verwendet werden können, wodurch stabile und schnelle Verbindungen zwischen Systemen entstehen.',
        'paragraph_2' => 'Diese API ist der Pfad, der von Partnern oder Hosts verwendet werden kann, um zwischen Programmen zu interagieren. Die API kann verwendet werden, um Anfragen wie Kontostandsprüfung, Servicepreisprüfung, Transaktionsstatusprüfung und Erstellung neuer Transaktionen durchzuführen.',
        'paragraph_3' => 'Diese API-Verbindung erfordert grundlegende Kenntnisse der Computerprogrammierung. Wenn Sie die von uns bereitgestellte Dokumentation nicht verstehen, kontaktieren Sie uns bitte.',
        'paragraph_4' => 'Es gibt mehrere Dinge, die für die API-Verbindung beachtet werden müssen, einschließlich:',
        'bullet_1' => 'Wir wrappen alle HTTP-Antworten im <strong>JSON</strong>-Format.',
        'bullet_2' => 'Alle HTTP-Anfragen werden als <strong>POST</strong>-Anfragen gesendet.',
        'bullet_3' => 'Bitte fügen Sie Ihre IP in den Kontoeinstellungen zur Whitelist hinzu.',
    ],
    'labels' => [
        'preparation' => 'Vorbereitung',
        'profile' => 'Profil',
        'services' => 'Service-Liste',
        'create_order' => 'Bestellung Erstellen',
        'status_order' => 'Bestellstatus',
        'create_order_refill' => 'Bestellungs-Nachfüllung Erstellen',
        'status_order_refill' => 'Status der Bestellungs-Nachfüllung',
        'create_order_cancel' => 'Bestellungsstornierung',
        'endpoint' => 'Endpoint',
        'body_request' => 'Anfrage-Body',
        'example_request' => 'Beispiel-Anfrage',
        'example_response' => 'Beispiel-Antwort',
        'parameter' => 'Parameter',
        'type'      => 'Datentyp',
        'required'  => 'Erforderlich',
        'description' => 'Beschreibung',
        'success' => 'Erfolg',
        'fail' => 'Fehlgeschlagen',
    ],
    'fields' => [
        'api_key' => [
            'required' => 'Ja',
            'description' => 'API-Schlüssel, der in den API-Einstellungen konfiguriert wurde',
        ],
        'secret_key' => [
            'required' => 'Ja',
            'description' => 'Geheimer Schlüssel, der in den API-Einstellungen konfiguriert wurde',
        ],
        'is_favorites' => [
            'required' => 'Nein',
            'description' => 'Mit <code class="bg-muted rounded px-1 py-0.5 text-destructive">true</code> ausfüllen, um Lieblingsdienste anzuzeigen',
        ],
        'id' => [
            'required' => 'Ja',
            'description' => 'Bestell-ID, durch Komma (,) getrennt für Massenprüfung',
        ],
        'order_id' => [
            'required' => 'Ja',
            'description' => 'Bestell-ID',
        ],
        'order_refill_id' => [
            'required' => 'Ja',
            'description' => 'Nachfüll-ID der Bestellung',
        ],
        'service_id' => [
            'required' => 'Ja',
            'description' => 'Service-ID, siehe mehr',
        ],
        'target' => [
            'required' => 'Ja',
            'description' => 'Bestellziel, wie Benutzername/Link/andere',
        ],
        'quantity' => [
            'required' => 'Ja',
            'description' => 'Bestellmenge',
        ],
        'usernames' => [
            'required' => 'Ja',
            'description' => 'Liste von Benutzernamen, getrennt durch <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> oder <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtags' => [
            'required' => 'Ja',
            'description' => 'Liste von Hashtags, getrennt durch <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> oder <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtag' => [
            'required' => 'Ja',
            'description' => 'Hashtag zum Erfassen/Suchen von Benutzernamen',
        ],
        'username' => [
            'required' => 'Ja',
            'description' => 'Benutzername des Kommentar-Eigentümers',
        ],
        'media' => [
            'required' => 'Ja',
            'description' => 'Media-URL zum Erfassen/Suchen der Liste der Likes',
        ],
        'answer_number' => [
            'required' => 'Ja',
            'description' => 'Antwortnummer aus der Optionsliste',
        ],
        'comments' => [
            'required' => 'Ja',
            'description' => 'Liste von Kommentaren, getrennt durch <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> oder <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
    ],
    'responses' => [
        'total_order_count'   => 'Gesamtanzahl der Bestellungen',
        'total_deposit_count' => 'Gesamtanzahl der Einzahlungen',
        'api_key_required'     => 'api_key ist erforderlich.',
        'secret_key_required'  => 'secret_key ist erforderlich.',
        'ip_not_whitelisted'   => 'Ihre IP :ip ist nicht in der IP-Whitelist registriert.',
        'service_id_required'       => 'service_id ist erforderlich.',
        'service_id_numeric'        => 'service_id muss eine Zahl sein.',
        'service_id_invalid'        => 'Die ausgewählte service_id ist ungültig.',
        'quantity_numeric'          => 'quantity muss eine Zahl sein.',
        'quantity_min'              => 'quantity muss mindestens :min betragen.',
        'insufficient_balance'      => 'Ihr Saldo ist unzureichend.',
        'service_not_available'     => 'Der Service ist nicht verfügbar.',
        'no_data_found'  => 'Keine Bestellungen gefunden.',
        'data_found'  => 'Bestellungen gefunden.',
        'id_invalid' => 'Die ausgewählte ID ist ungültig.',
        'order_cannot_be_refilled' => 'Die Bestellung kann nicht nachgefüllt werden.',
    ],
];

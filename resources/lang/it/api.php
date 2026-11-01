<?php

return [
    'description' => [
        'paragraph_1' => 'API (Application Programming Interface) è un insieme di comandi, funzioni e protocolli che possono essere utilizzati dai programmatori durante la creazione di software, creando interconnessioni stabili e veloci tra sistemi.',
        'paragraph_2' => 'Questa API è il percorso che può essere utilizzato da partner o host per interagire tra programmi. L\'API può essere utilizzata per effettuare richieste come controllare il saldo dell\'account, controllare il prezzo del servizio, controllare lo stato della transazione e creare nuove transazioni.',
        'paragraph_3' => 'Questa connessione API richiede conoscenze di base sulla programmazione informatica. Se non comprendi la documentazione che forniamo, ti preghiamo di contattarci.',
        'paragraph_4' => 'Ci sono diverse cose da considerare per la connessione API, tra cui:',
        'bullet_1' => 'Avvolgiamo tutte le risposte HTTP in formato <strong>JSON</strong>.',
        'bullet_2' => 'Tutte le richieste HTTP vengono inviate come richieste <strong>POST</strong>.',
        'bullet_3' => 'Per favore aggiungi la tua IP alla whitelist nelle impostazioni dell\'account.',
    ],
    'labels' => [
        'preparation' => 'Preparazione',
        'profile' => 'Profilo',
        'services' => 'Elenco Servizi',
        'create_order' => 'Crea Ordine',
        'status_order' => 'Stato Ordine',
        'create_order_refill' => 'Crea Ricarica Ordine',
        'status_order_refill' => 'Stato Ricarica Ordine',
        'create_order_cancel' => 'Annullamento Ordine',
        'endpoint' => 'Endpoint',
        'body_request' => 'Corpo Richiesta',
        'example_request' => 'Esempio Richiesta',
        'example_response' => 'Esempio Risposta',
        'parameter' => 'Parametro',
        'type'      => 'Tipo di Dato',
        'required'  => 'Obbligatorio',
        'description' => 'Descrizione',
        'success' => 'Successo',
        'fail' => 'Fallito',
    ],
    'fields' => [
        'api_key' => [
            'required' => 'Sì',
            'description' => 'Chiave API configurata nelle impostazioni API',
        ],
        'secret_key' => [
            'required' => 'Sì',
            'description' => 'Chiave Segreta configurata nelle impostazioni API',
        ],
        'is_favorites' => [
            'required' => 'No',
            'description' => 'Compila con <code class="bg-muted rounded px-1 py-0.5 text-destructive">true</code> per visualizzare i servizi preferiti',
        ],
        'id' => [
            'required' => 'Sì',
            'description' => 'ID ordine, separati da virgola (,) per controllo in massa',
        ],
        'order_id' => [
            'required' => 'Sì',
            'description' => 'ID ordine',
        ],
        'order_refill_id' => [
            'required' => 'Sì',
            'description' => 'ID ricarica ordine',
        ],
        'service_id' => [
            'required' => 'Sì',
            'description' => 'ID Servizio, vedi di più',
        ],
        'target' => [
            'required' => 'Sì',
            'description' => 'Obiettivo ordine, come username/link/altro',
        ],
        'quantity' => [
            'required' => 'Sì',
            'description' => 'Quantità ordine',
        ],
        'usernames' => [
            'required' => 'Sì',
            'description' => 'Elenco username separati da <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> o <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtags' => [
            'required' => 'Sì',
            'description' => 'Elenco hashtag separati da <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> o <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtag' => [
            'required' => 'Sì',
            'description' => 'Hashtag per catturare/cercare username',
        ],
        'username' => [
            'required' => 'Sì',
            'description' => 'Username del proprietario del commento',
        ],
        'media' => [
            'required' => 'Sì',
            'description' => 'URL Media per catturare/cercare l\'elenco dei mi piace',
        ],
        'answer_number' => [
            'required' => 'Sì',
            'description' => 'Numero risposta dall\'elenco delle opzioni',
        ],
        'comments' => [
            'required' => 'Sì',
            'description' => 'Elenco commenti separati da <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> o <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
    ],
    'responses' => [
        'total_order_count'   => 'Numero totale di ordini',
        'total_deposit_count' => 'Numero totale di depositi',
        'api_key_required'     => 'api_key è obbligatorio.',
        'secret_key_required'  => 'secret_key è obbligatorio.',
        'ip_not_whitelisted'   => 'Il tuo IP :ip non è registrato nella Whitelist IP.',
        'service_id_required'       => 'service_id è obbligatorio.',
        'service_id_numeric'        => 'service_id deve essere un numero.',
        'service_id_invalid'        => 'Il service_id selezionato non è valido.',
        'quantity_numeric'          => 'quantity deve essere un numero.',
        'quantity_min'              => 'quantity deve essere almeno :min.',
        'insufficient_balance'      => 'Il tuo saldo è insufficiente.',
        'service_not_available'     => 'Il servizio non è disponibile.',
        'no_data_found'  => 'nessun ordine trovato.',
        'data_found'  => 'ordini trovati.',
        'id_invalid' => 'l\'id selezionato non è valido.',
        'order_cannot_be_refilled' => 'l\'ordine non può essere ricaricato.',
    ],
];

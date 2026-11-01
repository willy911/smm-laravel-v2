<?php

return [
    'description' => [
        'paragraph_1' => 'API (Interfaz de Programación de Aplicaciones) es un conjunto de comandos, funciones y protocolos que pueden ser utilizados por programadores al construir software, creando así interconexiones estables y rápidas entre sistemas.',
        'paragraph_2' => 'Esta API es la ruta que pueden usar los socios o hosts para interactuar entre programas. La API se puede usar para realizar solicitudes como verificar el saldo de la cuenta, verificar precios de servicios, verificar el estado de las transacciones y crear nuevas transacciones.',
        'paragraph_3' => 'Esta conexión API requiere conocimientos básicos de programación informática. Si no entiendes la documentación que proporcionamos, por favor contáctanos.',
        'paragraph_4' => 'Hay varias cosas que deben tenerse en cuenta para la conexión API, incluyendo:',
        'bullet_1' => 'Envuelve todas las respuestas HTTP en formato <strong>JSON</strong>.',
        'bullet_2' => 'Todas las solicitudes HTTP se envían como solicitudes <strong>POST</strong>.',
        'bullet_3' => 'Por favor, agrega tu IP a la lista blanca en la configuración de tu cuenta.',
    ],
    'labels' => [
        'preparation' => 'Preparación',
        'profile' => 'Perfil',
        'services' => 'Lista de Servicios',
        'create_order' => 'Crear Pedido',
        'status_order' => 'Estado del Pedido',
        'create_order_refill' => 'Crear Recarga de Pedido',
        'status_order_refill' => 'Estado de Recarga de Pedido',
        'create_order_cancel' => 'Cancelación de Pedido',
        'endpoint' => 'Endpoint',
        'body_request' => 'Cuerpo de Solicitud',
        'example_request' => 'Ejemplo de Solicitud',
        'example_response' => 'Ejemplo de Respuesta',
        'parameter' => 'Parámetro',
        'type'      => 'Tipo de Dato',
        'required'  => 'Obligatorio',
        'description' => 'Descripción',
        'success' => 'Éxito',
        'fail' => 'Fallido',
    ],
    'fields' => [
        'api_key' => [
            'required' => 'Sí',
            'description' => 'Clave API que se ha configurado en la configuración de API',
        ],
        'secret_key' => [
            'required' => 'Sí',
            'description' => 'Clave Secreta que se ha configurado en la configuración de API',
        ],
        'is_favorites' => [
            'required' => 'No',
            'description' => 'Completa con <code class="bg-muted rounded px-1 py-0.5 text-destructive">true</code> para mostrar servicios favoritos',
        ],
        'id' => [
            'required' => 'Sí',
            'description' => 'ID del pedido, separa con coma (,) para verificación masiva',
        ],
        'order_id' => [
            'required' => 'Sí',
            'description' => 'ID del pedido',
        ],
        'order_refill_id' => [
            'required' => 'Sí',
            'description' => 'ID de recarga del pedido',
        ],
        'service_id' => [
            'required' => 'Sí',
            'description' => 'ID del Servicio, ver más',
        ],
        'target' => [
            'required' => 'Sí',
            'description' => 'Objetivo del pedido, como nombre de usuario/enlace/otros',
        ],
        'quantity' => [
            'required' => 'Sí',
            'description' => 'Cantidad del pedido',
        ],
        'usernames' => [
            'required' => 'Sí',
            'description' => 'Lista de nombres de usuario separados por <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> o <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtags' => [
            'required' => 'Sí',
            'description' => 'Lista de hashtags separados por <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> o <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtag' => [
            'required' => 'Sí',
            'description' => 'Hashtag para capturar/buscar nombre de usuario',
        ],
        'username' => [
            'required' => 'Sí',
            'description' => 'Nombre de usuario del propietario del comentario',
        ],
        'media' => [
            'required' => 'Sí',
            'description' => 'URL de Media para capturar/buscar lista de me gusta',
        ],
        'answer_number' => [
            'required' => 'Sí',
            'description' => 'Número de respuesta de la lista de opciones',
        ],
        'comments' => [
            'required' => 'Sí',
            'description' => 'Lista de comentarios separados por <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> o <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
    ],
    'responses' => [
        'total_order_count'   => 'Total de pedidos',
        'total_deposit_count' => 'Total de depósitos',
        'api_key_required'     => 'api_key es obligatorio.',
        'secret_key_required'  => 'secret_key es obligatorio.',
        'ip_not_whitelisted'   => 'Tu IP :ip no está registrada en la Lista Blanca de IP.',
        'service_id_required'       => 'service_id es obligatorio.',
        'service_id_numeric'        => 'service_id debe ser un número.',
        'service_id_invalid'        => 'El service_id seleccionado no es válido.',
        'quantity_numeric'          => 'quantity debe ser un número.',
        'quantity_min'              => 'quantity debe ser al menos :min.',
        'insufficient_balance'      => 'Tu saldo es insuficiente.',
        'service_not_available'     => 'El servicio no está disponible.',
        'no_data_found'  => 'No se encontraron pedidos.',
        'data_found'  => 'Pedidos encontrados.',
        'id_invalid' => 'El ID seleccionado no es válido.',
        'order_cannot_be_refilled' => 'El pedido no se puede recargar.',
    ],
];

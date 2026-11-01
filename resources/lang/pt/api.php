<?php

return [
    'description' => [
        'paragraph_1' => 'A API (Application Programming Interface) é um conjunto de comandos, funções e protocolos que podem ser usados por programadores ao construir software, permitindo uma interconexão estável e rápida entre sistemas.',
        'paragraph2' => 'Esta API é o caminho que parceiros e hosts podem usar para interagir entre programas. A API pode ser usada para fazer solicitações como verificar o saldo da conta, verificar o preço do serviço, verificar o status da transação e criar novas transações.',
        'paragraph3' => 'A conexão da API requer conhecimento básico de programação de computadores. Se você não entender a documentação que fornecemos, entre em contato conosco.',
        'paragraph4' => 'Alguns pontos importantes a serem observados para a conexão da API são:',
        'bullet_1' => 'Nós envolvemos todas as Respostas HTTP no formato <strong>JSON</strong>.',
        'bullet_2' => 'Todas as Requisições HTTP são enviadas como Requisição <strong>POST</strong>.',
        'bullet_3' => 'Por favor, adicione seu IP à Whitelist nas configurações da sua conta.',
    ],
    'labels' => [
        'preparation' => 'Preparação',
        'profile' => 'Perfil',
        'services' => 'Lista de Serviços',
        'create_order' => 'Criar Pedido',
        'status_order' => 'Status do Pedido',
        'create_order_refill' => 'Criar Recarga de Pedido',
        'status_order_refill' => 'Status da Recarga de Pedido',
        'create_order_cancel' => 'Cancelamento de Pedido',
        'endpoint' => 'Endpoint',
        'body_request' => 'Corpo da Requisição',
        'example_request' => 'Exemplo de Requisição',
        'example_response' => 'Exemplo de Resposta',
        'parameter' => 'Parâmetro',
        'type' => 'Tipo de Dado',
        'required' => 'Obrigatório',
        'description' => 'Descrição',
        'success' => 'Sucesso',
        'fail' => 'Falha',
    ],
    'fields' => [
        'api_key' => [
            'required' => 'Sim',
            'description' => 'A Chave API configurada nas configurações de API',
        ],
        'secret_key' => [
            'required' => 'Sim',
            'description' => 'A Chave Secreta configurada nas configurações de API',
        ],
        'is_favorites' => [
            'required' => 'Não',
            'description' => 'Preencha com <code class="bg-muted rounded px-1 py-0.5 text-destructive">true</code> para exibir os serviços favoritos',
        ],
        'id' => [
            'required' => 'Sim',
            'description' => 'ID do pedido, separe com vírgula (,) para verificação em massa',
        ],
        'order_id' => [
            'required' => 'Sim',
            'description' => 'ID do pedido',
        ],
        'order_refill_id' => [
            'required' => 'Sim',
            'description' => 'ID da recarga do pedido',
        ],
        'service_id' => [
            'required' => 'Sim',
            'description' => 'ID do Serviço, veja mais detalhes',
        ],
        'target' => [
            'required' => 'Sim',
            'description' => 'Alvo do pedido, como nome de usuário/link/outros',
        ],
        'quantity' => [
            'required' => 'Sim',
            'description' => 'Quantidade do pedido',
        ],
        'usernames' => [
            'required' => 'Sim',
            'description' => 'Lista de nomes de usuário separados por <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> ou <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtags' => [
            'required' => 'Sim',
            'description' => 'Lista de hashtags separadas por <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> ou <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
        'hashtag' => [
            'required' => 'Sim',
            'description' => 'Hashtag para capturar/procurar nomes de usuário',
        ],
        'username' => [
            'required' => 'Sim',
            'description' => 'Nome de usuário do proprietário do comentário',
        ],
        'media' => [
            'required' => 'Sim',
            'description' => 'URL da Mídia para capturar/procurar a lista de curtidas',
        ],
        'answer_number' => [
            'required' => 'Sim',
            'description' => 'Número da resposta da lista de opções',
        ],
        'comments' => [
            'required' => 'Sim',
            'description' => 'Lista de comentários separados por <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\r\\n</code> ou <code class="bg-muted rounded px-1 py-0.5 text-destructive">\\n</code>',
        ],
    ],
    'responses' => [
        'total_order_count' => 'Contagem total de pedidos',
        'total_deposit_count' => 'Contagem total de depósitos',
        'api_key_required' => 'api_key é obrigatório.',
        'secret_key_required' => 'secret_key é obrigatório.',
        'ip_not_whitelisted' => 'Seu IP :ip não está na Whitelist de IP.',
        'service_id_required' => 'service_id é obrigatório.',
        'service_id_numeric' => 'service_id deve ser numérico.',
        'service_id_invalid' => 'O service_id selecionado é inválido.',
        'quantity_numeric' => 'quantity deve ser numérico.',
        'quantity_min' => 'quantity deve ter no mínimo :min.',
        'insufficient_balance' => 'Seu saldo é insuficiente.',
        'service_not_available' => 'Serviço indisponível.',
        'no_data_found' => 'nenhum pedido encontrado.',
        'data_found' => 'pedido encontrado.',
        'id_invalid' => 'o id selecionado é inválido.',
        'order_cannot_be_refilled' => 'o pedido não pode ser recarregado.',
    ],
];

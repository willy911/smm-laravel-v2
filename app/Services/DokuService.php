<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class DokuService
{
    protected string $baseUrl;
    protected string $clientId;
    protected string $sharedKey;

    public function __construct()
    {
        $this->baseUrl   = config('services.doku.base_url');
        $this->clientId  = config('services.doku.client_id');
        $this->sharedKey = config('services.doku.shared_key');
    }

    protected function generateSignature(
        string $requestId,
        string $requestTimestamp,
        string $requestTarget,
        string $body
    ): string {
        $digest = base64_encode(hash('sha256', $body, true));

        $signatureComponent = "Client-Id:{$this->clientId}\n"
            . "Request-Id:{$requestId}\n"
            . "Request-Timestamp:{$requestTimestamp}\n"
            . "Request-Target:{$requestTarget}\n"
            . "Digest:{$digest}";

        return base64_encode(
            hash_hmac('sha256', $signatureComponent, $this->sharedKey, true)
        );
    }

    public function createPayment(array $payload)
    {
        $requestId        = uniqid();
        $requestTimestamp = now()->toIso8601String();
        $requestTarget    = '/checkout/v1/payment';

        $body = json_encode($payload);

        $signature = $this->generateSignature(
            $requestId,
            $requestTimestamp,
            $requestTarget,
            $body
        );

        return Http::withHeaders([
            'Client-Id'        => $this->clientId,
            'Request-Id'       => $requestId,
            'Request-Timestamp' => $requestTimestamp,
            'Signature'        => "HMACSHA256={$signature}",
            'Content-Type'     => 'application/json',
        ])->post($this->baseUrl . $requestTarget, $payload);
    }
}

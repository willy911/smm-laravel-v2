<?php

namespace App\Http\Middleware;

use App\Models\User\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class API
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->input('api_key')) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid Payload',
                'errors'  => [
                    'The api_key field is required.'
                ]
            ], 400, [], JSON_PRETTY_PRINT);
        }

        if (!$request->input('secret_key')) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid Payload',
                'errors'  => [
                    'The secret_key field is required.'
                ]
            ], 400, [], JSON_PRETTY_PRINT);
        }

        $checkUser = $user = User::with('userGroup')
            ->whereJsonContains('api->api_key', escape_input($request->input('api_key')))
            ->whereJsonContains('api->secret_key', escape_input($request->input('secret_key')))
            ->where('status', 1)
            ->first();

        if (!$checkUser) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid Signature',
                'errors'  => [
                    'Account not found.'
                ]
            ], 401, [], JSON_PRETTY_PRINT);
        }

        if (!$user->userGroup?->is_api_access_enabled) {
            return response()->json([
                'status'  => false,
                'message' => 'Forbidden Access',
                'errors'  => [
                    'You do not have access to use the API.'
                ]
            ], 401, [], JSON_PRETTY_PRINT);
        }

        // $clientIp = $request->header('CF-Connecting-IP', $request->ip());

        // $whitelistString = escape_input($user->api['whitelist_ip'] ?? '');
        // $whitelistArray = array_map('trim', explode(',', $whitelistString));

        // if (!in_array($clientIp, $whitelistArray, true)) {
        //     return response()->json([
        //         'status'  => false,
        //         'message' => 'Invalid IP',
        //         'errors'  => [
        //             'Your IP ' . $clientIp . ' is not registered in the Whitelist IP.'
        //         ]
        //     ], 403, [], JSON_PRETTY_PRINT);
        // }

        return $next($request);
    }
}

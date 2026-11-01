<?php

namespace App\Http\Middleware;

use App\Models\User\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class APIV2
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->input('key') || !$request->input('action')) {
            return response()->json([
                'error'  => 'Incorrect Request'
            ], 400, [], JSON_PRETTY_PRINT);
        }

        $checkUser = $user = User::with('userGroup')
            ->whereJsonContains('api->api_key', escape_input($request->input('key')))
            ->where('status', 1)
            ->first();
        if (!$checkUser) {
            return response()->json([
                'error'  => 'Invalid API Key'
            ], 401, [], JSON_PRETTY_PRINT);
        }

        if (!$user->userGroup?->is_api_access_enabled) {
            return response()->json([
                'error'  => 'You do not have access to use the API'
            ], 401, [], JSON_PRETTY_PRINT);
        }

        // if (!in_array($request->ip(), explode(',', escape_input($user->api['whitelist_ip'])))) {
        //     return response()->json([
        //         'error'  => 'Your IP ' . $request->ip() . ' is not registered in the Whitelist IP.'
        //     ], 403, [], JSON_PRETTY_PRINT);
        // }

        // $clientIp = $request->header('CF-Connecting-IP', $request->ip());

        // $whitelistString = escape_input($user->api['whitelist_ip'] ?? '');
        // $whitelistArray = array_map('trim', explode(',', $whitelistString));

        // if (!in_array($clientIp, $whitelistArray, true)) {
        //     return response()->json([
        //         'error'  => 'Your IP ' . $clientIp . ' is not registered in the Whitelist IP.'
        //     ], 403, [], JSON_PRETTY_PRINT);
        // }

        return $next($request);
    }
}

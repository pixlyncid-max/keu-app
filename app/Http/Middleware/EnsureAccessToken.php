<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware: Pastikan token yang digunakan adalah 'access' token.
 * Mencegah refresh token dipakai untuk mengakses endpoint API biasa.
 *
 * Cara kerja:
 * - Sanctum auth:sanctum sudah memvalidasi token & user
 * - Middleware ini cek apakah nama token adalah 'access'
 * - Jika token bernama 'refresh', tolak dengan 401
 */
class EnsureAccessToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->user()?->currentAccessToken();

        if (! $token) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak ditemukan.',
            ], 401);
        }

        // Tolak jika ini adalah refresh token (bukan access token)
        if ($token->name === 'refresh') {
            return response()->json([
                'success' => false,
                'message' => 'Gunakan access token, bukan refresh token untuk mengakses endpoint ini.',
            ], 401);
        }

        return $next($request);
    }
}

<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',      // Daftarkan file routes/api.php
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',                        // Prefix /api (lalu /v1 di dalam file api.php)
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Alias untuk middleware kustom
        $middleware->alias([
            'ensure.access.token' => \App\Http\Middleware\EnsureAccessToken::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        /*
        |----------------------------------------------------------------------
        | Penanganan Error Terpusat untuk API
        | Semua exception di-render ke format JSON yang konsisten:
        | {
        |   "success": false,
        |   "message": "...",
        |   "errors": {...} // opsional, untuk ValidationException
        | }
        |----------------------------------------------------------------------
        */

        // Semua exception pada request API dikembalikan dalam format JSON
        $exceptions->render(function (\Throwable $e, Request $request) {
            if (!$request->expectsJson() && !$request->is('api/*')) {
                return null; // Biarkan default handler menangani non-API request
            }

            // ValidationException — error validasi form (422)
            if ($e instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data yang dikirim tidak valid.',
                    'errors'  => $e->errors(),
                ], 422);
            }

            // AuthenticationException — belum login atau token tidak valid (401)
            if ($e instanceof AuthenticationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak terautentikasi. Silakan login terlebih dahulu.',
                ], 401);
            }

            // NotFoundHttpException — resource tidak ditemukan (404)
            if ($e instanceof NotFoundHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resource tidak ditemukan.',
                ], 404);
            }

            // MethodNotAllowedHttpException — method HTTP tidak diizinkan (405)
            if ($e instanceof MethodNotAllowedHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Metode HTTP tidak diizinkan untuk endpoint ini.',
                ], 405);
            }

            // HttpException lainnya (403 Forbidden, dll.)
            if ($e instanceof HttpException) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Terjadi kesalahan HTTP.',
                ], $e->getStatusCode());
            }

            // Exception umum — tampilkan detail hanya di mode debug
            $statusCode = 500;
            $message    = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
            $debug      = [];

            if (config('app.debug')) {
                $message = $e->getMessage();
                $debug   = [
                    'exception' => get_class($e),
                    'file'      => $e->getFile(),
                    'line'      => $e->getLine(),
                    'trace'     => collect($e->getTrace())->take(5)->toArray(),
                ];
            }

            return response()->json(array_filter([
                'success' => false,
                'message' => $message,
                'debug'   => $debug ?: null,
            ]), $statusCode);
        });
    })->create();

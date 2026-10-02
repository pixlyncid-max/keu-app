<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Trait untuk format respons API yang konsisten.
 * Semua controller menggunakan trait ini.
 *
 * Format sukses:  { success: true,  message: "...", data: {...} }
 * Format error:   { success: false, message: "...", errors: {...} }
 * Format halaman: + meta: { current_page, per_page, total, last_page }
 */
trait ApiResponse
{
    /**
     * Respons sukses umum.
     */
    protected function success(mixed $data = null, string $message = 'Berhasil', int $code = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if (! is_null($data)) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }

    /**
     * Respons sukses dengan HTTP 201 Created.
     */
    protected function created(mixed $data, string $message = 'Data berhasil dibuat'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    /**
     * Respons error.
     */
    protected function error(string $message, int $code = 400, array $errors = []): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (! empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Respons 404 Not Found.
     */
    protected function notFound(string $message = 'Data tidak ditemukan'): JsonResponse
    {
        return $this->error($message, 404);
    }

    /**
     * Respons 403 Forbidden.
     */
    protected function forbidden(string $message = 'Akses tidak diizinkan'): JsonResponse
    {
        return $this->error($message, 403);
    }

    /**
     * Respons untuk data terpaginasi.
     * Menerima LengthAwarePaginator dan nama Resource class.
     */
    protected function paginated(LengthAwarePaginator $paginator, string $resourceClass, string $message = 'Berhasil'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $resourceClass::collection($paginator->items()),
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
        ]);
    }
}

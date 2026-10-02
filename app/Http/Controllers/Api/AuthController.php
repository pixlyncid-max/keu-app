<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * AuthController — Mengelola autentikasi user.
 *
 * Routes:
 *   POST /api/v1/auth/register   → register()
 *   POST /api/v1/auth/login      → login()
 *   POST /api/v1/auth/logout     → logout()     [protected]
 *   POST /api/v1/auth/refresh    → refresh()    [publik, pakai body]
 *   GET  /api/v1/auth/me         → me()         [protected]
 *   PUT  /api/v1/auth/password   → changePassword() [protected]
 */
class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(private AuthService $authService) {}

    // =========================================================
    // POST /api/v1/auth/register
    // =========================================================
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return $this->created([
            'user'          => new UserResource($result['user']),
            'access_token'  => $result['access_token'],
            'refresh_token' => $result['refresh_token'],
            'token_type'    => 'Bearer',
            'expires_in'    => $result['expires_in'],
        ], 'Registrasi berhasil. Selamat datang!');
    }

    // =========================================================
    // POST /api/v1/auth/login
    // =========================================================
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->email,
            $request->password
        );

        if (! $result) {
            return $this->error('Email atau password salah.', 401);
        }

        return $this->success([
            'user'          => new UserResource($result['user']),
            'access_token'  => $result['access_token'],
            'refresh_token' => $result['refresh_token'],
            'token_type'    => 'Bearer',
            'expires_in'    => $result['expires_in'],
        ], 'Login berhasil.');
    }

    // =========================================================
    // POST /api/v1/auth/logout  [Protected]
    // =========================================================
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return $this->success(null, 'Logout berhasil.');
    }

    // =========================================================
    // POST /api/v1/auth/refresh  [Publik — pakai body]
    // Body: { "refresh_token": "plain_token_string" }
    // =========================================================
    public function refresh(Request $request): JsonResponse
    {
        $request->validate([
            'refresh_token' => ['required', 'string'],
        ], [
            'refresh_token.required' => 'Refresh token wajib diisi.',
        ]);

        $result = $this->authService->refresh($request->refresh_token);

        if (! $result) {
            return $this->error('Refresh token tidak valid atau sudah kadaluarsa. Silakan login ulang.', 401);
        }

        return $this->success($result, 'Token berhasil diperbarui.');
    }

    // =========================================================
    // GET /api/v1/auth/me  [Protected]
    // =========================================================
    public function me(Request $request): JsonResponse
    {
        return $this->success(
            new UserResource($request->user()),
            'Data profil berhasil diambil.'
        );
    }

    // =========================================================
    // PUT /api/v1/auth/password  [Protected]
    // =========================================================
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $berhasil = $this->authService->changePassword(
            $request->user(),
            $request->password_lama,
            $request->password_baru
        );

        if (! $berhasil) {
            return $this->error('Password lama tidak sesuai.', 422);
        }

        return $this->success(null, 'Password berhasil diubah. Silakan login ulang.');
    }

    // =========================================================
    // DELETE /api/v1/auth/account  [Protected]
    // =========================================================
    public function deleteAccount(\App\Http\Requests\DeleteAccountRequest $request): JsonResponse
    {
        $berhasil = $this->authService->deleteAccount($request->user(), $request->password);

        if (! $berhasil) {
            return $this->error('Konfirmasi password tidak sesuai.', 422);
        }

        return $this->success(null, 'Akun dan seluruh data Anda telah berhasil dihapus secara permanen.');
    }
}


<?php

namespace App\Services;

use App\Models\PersonalAccessToken;
use App\Models\User;
use App\Models\Wallet;
use Database\Seeders\DefaultCategoriesSeeder;
use Illuminate\Support\Facades\Hash;

/**
 * AuthService — Business logic untuk autentikasi.
 *
 * - register(): Buat user + kategori default + dompet Tunai, lalu login
 * - login(): Verifikasi kredensial, buat access + refresh token
 * - logout(): Revoke semua token user saat ini
 * - refresh(): Validasi refresh token, buat access token baru
 * - changePassword(): Verifikasi password lama, simpan password baru
 */
class AuthService
{
    /**
     * Durasi token dalam menit.
     */
    private const ACCESS_TOKEN_MINUTES  = 60;           // 1 jam
    private const REFRESH_TOKEN_DAYS    = 30;            // 30 hari

    /**
     * Daftarkan user baru.
     * Secara otomatis membuat:
     * - Kategori default (14 kategori pemasukan & pengeluaran)
     * - Satu dompet "Tunai" dengan saldo awal 0
     */
    public function register(array $data): array
    {
        $user = User::create([
            'nama'     => $data['nama'],
            'email'    => $data['email'],
            'password' => $data['password'], // Otomatis di-hash oleh cast 'hashed'
            'timezone' => $data['timezone'] ?? 'Asia/Makassar',
        ]);

        // Buat 14 kategori default
        DefaultCategoriesSeeder::buatKategoriDefault($user);

        // Buat dompet Tunai default
        Wallet::create([
            'user_id'    => $user->id,
            'nama'       => 'Tunai',
            'tipe'       => 'tunai',
            'saldo_awal' => 0,
            'warna'      => '#10b981',
            'ikon'       => 'wallet',
            'urutan'     => 1,
        ]);

        return $this->generateTokens($user);
    }

    /**
     * Login user.
     * Verifikasi email & password, lalu buat access + refresh token.
     */
    public function login(string $email, string $password): array|false
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return false;
        }

        // Cabut token lama sebelum membuat yang baru
        $this->revokeUserTokens($user);

        return $this->generateTokens($user);
    }

    /**
     * Logout: revoke semua token milik user ini.
     */
    public function logout(User $user): void
    {
        $this->revokeUserTokens($user);
    }

    /**
     * Refresh: Validasi refresh token → buat access token baru.
     * Mengembalikan data token baru atau null jika tidak valid.
     */
    public function refresh(string $plainRefreshToken): ?array
    {
        // Cari token di DB (PersonalAccessToken::findToken sudah cek revoked)
        $tokenRecord = PersonalAccessToken::findToken($plainRefreshToken);

        if (! $tokenRecord) {
            return null;
        }

        // Pastikan ini adalah refresh token, bukan access token
        if ($tokenRecord->name !== 'refresh') {
            return null;
        }

        // Cek kadaluarsa
        if ($tokenRecord->expires_at && $tokenRecord->expires_at->isPast()) {
            $tokenRecord->update(['revoked' => true]);
            return null;
        }

        /** @var User $user */
        $user = $tokenRecord->tokenable;

        // Revoke access token lama (refresh token tetap)
        $user->tokens()->where('name', 'access')->update(['revoked' => true]);

        // Buat access token baru
        $newAccessToken = $user->createToken(
            'access',
            ['*'],
            now()->addMinutes(self::ACCESS_TOKEN_MINUTES)
        );

        return [
            'access_token' => $newAccessToken->plainTextToken,
            'token_type'   => 'Bearer',
            'expires_in'   => self::ACCESS_TOKEN_MINUTES * 60, // dalam detik
        ];
    }

    /**
     * Ubah password user.
     * Verifikasi password lama sebelum menyimpan yang baru.
     */
    public function changePassword(User $user, string $passwordLama, string $passwordBaru): bool
    {
        if (! Hash::check($passwordLama, $user->password)) {
            return false;
        }

        $user->update(['password' => $passwordBaru]); // Cast 'hashed' otomatis hash

        // Revoke semua token (user harus login ulang)
        $this->revokeUserTokens($user);

        return true;
    }

    /**
     * Hapus akun user beserta seluruh datanya (wajib konfirmasi password).
     */
    public function deleteAccount(User $user, string $password): bool
    {
        if (! Hash::check($password, $user->password)) {
            return false;
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($user) {
            $user->tokens()->delete();
            $user->delete(); // On cascade delete pada FK database akan menghapus seluruh data user
        });

        return true;
    }


    // =========================================================
    // PRIVATE HELPERS
    // =========================================================

    /**
     * Buat pasangan access token + refresh token untuk user.
     * Kembalikan data token dan info user.
     */
    private function generateTokens(User $user): array
    {
        $accessToken = $user->createToken(
            'access',
            ['*'],
            now()->addMinutes(self::ACCESS_TOKEN_MINUTES)
        );

        $refreshToken = $user->createToken(
            'refresh',
            ['refresh'],
            now()->addDays(self::REFRESH_TOKEN_DAYS)
        );

        return [
            'user'          => $user,
            'access_token'  => $accessToken->plainTextToken,
            'refresh_token' => $refreshToken->plainTextToken,
            'token_type'    => 'Bearer',
            'expires_in'    => self::ACCESS_TOKEN_MINUTES * 60,
        ];
    }

    /**
     * Revoke (cabut) semua token milik user (bukan hanya yang aktif).
     */
    private function revokeUserTokens(User $user): void
    {
        $user->tokens()->update(['revoked' => true]);
    }
}

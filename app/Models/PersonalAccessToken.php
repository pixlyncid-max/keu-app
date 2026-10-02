<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumToken;

/**
 * Extends Sanctum's PersonalAccessToken untuk mendukung field 'revoked'.
 * Override findToken() agar token yang di-revoke tidak bisa digunakan.
 */
class PersonalAccessToken extends SanctumToken
{
    /**
     * Kolom tambahan yang bisa diisi.
     */
    protected $fillable = [
        'tokenable_type',
        'tokenable_id',
        'name',
        'token',
        'abilities',
        'expires_at',
        'revoked',      // Field kustom untuk pencabutan token
    ];

    protected function casts(): array
    {
        return [
            'abilities'  => 'json',
            'expires_at' => 'datetime',
            'revoked'    => 'boolean',
            'last_used_at' => 'datetime',
        ];
    }

    /**
     * Override: Cari token dan pastikan tidak di-revoke.
     * Sanctum sudah cek expires_at, kita tambah cek revoked.
     */
    public static function findToken($token)
    {
        $instance = parent::findToken($token);

        // Tolak jika sudah di-revoke
        if (! $instance || $instance->revoked) {
            return null;
        }

        return $instance;
    }
}

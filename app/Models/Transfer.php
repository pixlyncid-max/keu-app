<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'dari_wallet_id',
        'ke_wallet_id',
        'nominal',
        'biaya_admin',
        'tanggal',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'nominal'     => 'decimal:2',
            'biaya_admin' => 'decimal:2',
            'tanggal'     => 'date',
        ];
    }

    // =========================================================
    // RELASI
    // =========================================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dariWallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class, 'dari_wallet_id');
    }

    public function keWallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class, 'ke_wallet_id');
    }
}

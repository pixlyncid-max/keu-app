<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nama',
        'tipe',
        'saldo_awal',
        'warna',
        'ikon',
        'is_archived',
        'urutan',
    ];

    protected function casts(): array
    {
        return [
            'saldo_awal'   => 'decimal:2',
            'is_archived'  => 'boolean',
            'urutan'       => 'integer',
        ];
    }

    // =========================================================
    // RELASI
    // =========================================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function transfersKeluar(): HasMany
    {
        return $this->hasMany(Transfer::class, 'dari_wallet_id');
    }

    public function transfersMasuk(): HasMany
    {
        return $this->hasMany(Transfer::class, 'ke_wallet_id');
    }

    public function savingsGoals(): HasMany
    {
        return $this->hasMany(SavingsGoal::class);
    }

    public function savingsContributions(): HasMany
    {
        return $this->hasMany(SavingsContribution::class);
    }

    // =========================================================
    // HELPER: Hitung saldo aktual dompet ini
    // saldo = saldo_awal + total_pemasukan - total_pengeluaran
    //       + transfer_masuk - transfer_keluar - biaya_admin_transfer
    // =========================================================
    public function getSaldoAktualAttribute(): float
    {
        $pemasukan = $this->transactions()
            ->where('tipe', 'pemasukan')
            ->sum('nominal');

        $pengeluaran = $this->transactions()
            ->where('tipe', 'pengeluaran')
            ->where(function ($q) {
                $q->whereNull('catatan')->orWhere('catatan', 'not like', '[Tabungan:%');
            })
            ->sum('nominal');

        $transferMasuk = $this->transfersMasuk()->sum('nominal');

        $transferKeluar = $this->transfersKeluar()->sum('nominal');
        $biayaAdmin     = $this->transfersKeluar()->sum('biaya_admin');

        // Biaya admin dipotong dari dompet pengirim
        $kontribusiTabungan = $this->savingsContributions()->sum('nominal');

        return (float) $this->saldo_awal
            + $pemasukan
            - $pengeluaran
            + $transferMasuk
            - $transferKeluar
            - $biayaAdmin
            - $kontribusiTabungan;
    }
}

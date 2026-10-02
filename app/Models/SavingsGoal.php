<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SavingsGoal extends Model
{
    use HasFactory;

    protected $table = 'savings_goals';

    protected $fillable = [
        'user_id',
        'wallet_id',
        'nama',
        'target_nominal',
        'tanggal_target',
        'ikon',
        'warna',
        'status',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'target_nominal' => 'decimal:2',
            'tanggal_target' => 'date',
        ];
    }

    // =========================================================
    // RELASI
    // =========================================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function contributions(): HasMany
    {
        return $this->hasMany(SavingsContribution::class, 'goal_id');
    }

    // =========================================================
    // ACCESSOR: Hitung total terkumpul
    // =========================================================
    public function getTotalTerkumpulAttribute(): float
    {
        return (float) $this->contributions()->sum('nominal');
    }

    public function getSisaAttribute(): float
    {
        return max(0, (float) $this->target_nominal - $this->total_terkumpul);
    }

    public function getPersentaseAttribute(): float
    {
        if ($this->target_nominal <= 0) {
            return 0;
        }

        return min(100, round(($this->total_terkumpul / $this->target_nominal) * 100, 1));
    }

    // =========================================================
    // HELPER: Cek dan update status jika target tercapai
    // =========================================================
    public function cekDanUpdateStatus(): void
    {
        if ($this->status === 'aktif' && $this->total_terkumpul >= (float) $this->target_nominal) {
            $this->update(['status' => 'tercapai']);
        }
    }
}

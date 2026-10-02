<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecurringTransaction extends Model
{
    use HasFactory;

    protected $table = 'recurring_transactions';

    protected $fillable = [
        'user_id',
        'wallet_id',
        'category_id',
        'tipe',
        'nominal',
        'catatan',
        'frekuensi',
        'interval',
        'tanggal_mulai',
        'tanggal_selesai',
        'next_run_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'nominal'         => 'decimal:2',
            'tanggal_mulai'   => 'date',
            'tanggal_selesai' => 'date',
            'next_run_date'   => 'date',
            'is_active'       => 'boolean',
            'interval'        => 'integer',
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

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'recurring_id');
    }

    // =========================================================
    // SCOPE
    // =========================================================

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeJatuhTempo($query)
    {
        return $query->where('next_run_date', '<=', now()->toDateString());
    }

    // =========================================================
    // HELPER: Hitung next_run_date berikutnya berdasarkan frekuensi
    // =========================================================
    public function hitungNextRunDate(\Carbon\Carbon $dari = null): \Carbon\Carbon
    {
        $base = $dari ?? $this->next_run_date;

        return match ($this->frekuensi) {
            'harian'   => $base->copy()->addDays($this->interval),
            'mingguan' => $base->copy()->addWeeks($this->interval),
            'bulanan'  => $base->copy()->addMonths($this->interval),
            'tahunan'  => $base->copy()->addYears($this->interval),
            default    => $base->copy()->addMonths($this->interval),
        };
    }
}

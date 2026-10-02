<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'bulan',
        'batas_nominal',
    ];

    protected function casts(): array
    {
        return [
            'batas_nominal' => 'decimal:2',
        ];
    }

    // =========================================================
    // RELASI
    // =========================================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // =========================================================
    // ACCESSOR: Hitung total pengeluaran pada bulan ini untuk kategori ini
    // =========================================================
    public function getTotalPengeluaranAttribute(): float
    {
        [$tahun, $bulan] = explode('-', $this->bulan);

        return (float) Transaction::where('user_id', $this->user_id)
            ->where('category_id', $this->category_id)
            ->where('tipe', 'pengeluaran')
            ->whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->sum('nominal');
    }

    public function getPersentasePenggunaanAttribute(): float
    {
        if ($this->batas_nominal <= 0) {
            return 0;
        }

        return min(100, round(($this->total_pengeluaran / $this->batas_nominal) * 100, 1));
    }

    public function getStatusAttribute(): string
    {
        $persen = $this->persentase_penggunaan;

        if ($persen >= 100) {
            return 'melebihi';  // Merah — sudah melebihi anggaran
        } elseif ($persen >= 80) {
            return 'peringatan'; // Kuning — hampir habis
        }

        return 'aman';           // Hijau — masih aman
    }
}

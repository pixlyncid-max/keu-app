<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Transaction
 */
class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'tipe'         => $this->tipe,
            'nominal'      => (float) $this->nominal,
            'jumlah'       => (float) $this->nominal,
            'tanggal'      => $this->tanggal?->format('Y-m-d'),
            'catatan'      => $this->catatan,
            // Relasi wallet — hanya field yang dibutuhkan frontend
            'wallet'       => $this->whenLoaded('wallet', fn () => [
                'id'    => $this->wallet->id,
                'nama'  => $this->wallet->nama,
                'ikon'  => $this->wallet->ikon,
                'warna' => $this->wallet->warna,
            ]),
            // Relasi kategori
            'category'     => $this->whenLoaded('category', fn () => [
                'id'    => $this->category->id,
                'nama'  => $this->category->nama,
                'ikon'  => $this->category->ikon,
                'warna' => $this->category->warna,
            ]),
            'recurring_id' => $this->recurring_id,
            'created_at'   => $this->created_at?->toIso8601String(),
        ];
    }
}

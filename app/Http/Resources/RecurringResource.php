<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\RecurringTransaction
 */
class RecurringResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'wallet_id'       => $this->wallet_id,
            'category_id'     => $this->category_id,
            'tipe'            => $this->tipe,
            'nominal'         => (float) $this->nominal,
            'catatan'         => $this->catatan,
            'frekuensi'       => $this->frekuensi,
            'interval'        => $this->interval,
            'tanggal_mulai'   => $this->tanggal_mulai ? Carbon::parse($this->tanggal_mulai)->format('Y-m-d') : null,
            'tanggal_selesai' => $this->tanggal_selesai ? Carbon::parse($this->tanggal_selesai)->format('Y-m-d') : null,
            'next_run_date'   => $this->next_run_date ? Carbon::parse($this->next_run_date)->format('Y-m-d') : null,
            'is_active'       => (bool) $this->is_active,
            'wallet'          => $this->whenLoaded('wallet', fn() => [
                'id'   => $this->wallet->id,
                'nama' => $this->wallet->nama,
            ]),
            'category'        => $this->whenLoaded('category', fn() => [
                'id'    => $this->category->id,
                'nama'  => $this->category->nama,
                'warna' => $this->category->warna,
                'ikon'  => $this->category->ikon,
            ]),
            'created_at'      => $this->created_at?->toIso8601String(),
        ];
    }
}

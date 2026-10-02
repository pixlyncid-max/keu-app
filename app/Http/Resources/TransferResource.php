<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Transfer
 */
class TransferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'dari_wallet' => $this->whenLoaded('dariWallet', fn () => [
                'id'    => $this->dariWallet->id,
                'nama'  => $this->dariWallet->nama,
                'ikon'  => $this->dariWallet->ikon,
                'warna' => $this->dariWallet->warna,
            ]),
            'ke_wallet'   => $this->whenLoaded('keWallet', fn () => [
                'id'    => $this->keWallet->id,
                'nama'  => $this->keWallet->nama,
                'ikon'  => $this->keWallet->ikon,
                'warna' => $this->keWallet->warna,
            ]),
            'nominal'     => (float) $this->nominal,
            'biaya_admin' => (float) $this->biaya_admin,
            'tanggal'     => $this->tanggal?->format('Y-m-d'),
            'catatan'     => $this->catatan,
            'created_at'  => $this->created_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Wallet
 */
class WalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'nama'         => $this->nama,
            'tipe'         => $this->tipe,
            'saldo_awal'   => (float) $this->saldo_awal,
            // saldo_aktual di-inject oleh WalletService::computeBalances()
            // atau WalletService::computeSingleBalance()
            'saldo_aktual' => isset($this->saldo_aktual)
                ? (float) $this->saldo_aktual
                : (float) $this->saldo_awal,
            'warna'        => $this->warna,
            'ikon'         => $this->ikon,
            'is_archived'  => (bool) $this->is_archived,
            'urutan'       => (int) $this->urutan,
            'created_at'   => $this->created_at?->toIso8601String(),
        ];
    }
}

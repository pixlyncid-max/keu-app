<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\SavingsGoal
 */
class SavingsGoalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'wallet_id'      => $this->wallet_id,
            'nama'           => $this->nama,
            'target_nominal' => (float) $this->target_nominal,
            'tanggal_target' => $this->tanggal_target ? Carbon::parse($this->tanggal_target)->format('Y-m-d') : null,
            'ikon'           => $this->ikon,
            'warna'          => $this->warna,
            'status'         => $this->status,
            'catatan'        => $this->catatan,
            'stats'          => $this->stats ?? null,
            'wallet'         => $this->whenLoaded('wallet', fn() => [
                'id'   => $this->wallet->id,
                'nama' => $this->wallet->nama,
            ]),
            'contributions'  => SavingsContributionResource::collection($this->whenLoaded('contributions')),
            'created_at'     => $this->created_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\SavingsContribution
 */
class SavingsContributionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'goal_id'   => $this->goal_id,
            'wallet_id' => $this->wallet_id,
            'nominal'   => (float) $this->nominal,
            'tanggal'   => $this->tanggal ? Carbon::parse($this->tanggal)->format('Y-m-d') : null,
            'catatan'   => $this->catatan,
            'created_at'=> $this->created_at?->toIso8601String(),
        ];
    }
}

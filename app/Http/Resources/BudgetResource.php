<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Budget
 */
class BudgetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'category_id'   => $this->category_id,
            'bulan'         => $this->bulan,
            'batas_nominal' => (float) $this->batas_nominal,
            'category'      => $this->whenLoaded('category', fn() => [
                'id'    => $this->category->id,
                'nama'  => $this->category->nama,
                'warna' => $this->category->warna,
                'ikon'  => $this->category->ikon,
            ]),
            'created_at'    => $this->created_at?->toIso8601String(),
        ];
    }
}

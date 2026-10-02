<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Category
 */
class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'nama'       => $this->nama,
            'tipe'       => $this->tipe,
            'ikon'       => $this->ikon,
            'warna'      => $this->warna,
            'is_default' => (bool) $this->is_default,
            'urutan'     => (int) $this->urutan,
        ];
    }
}

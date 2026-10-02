<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSavingsGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'wallet_id' => [
                'nullable',
                'integer',
                Rule::exists('wallets', 'id')->where('user_id', $userId),
            ],
            'nama'           => ['sometimes', 'string', 'max:150'],
            'target_nominal' => ['sometimes', 'numeric', 'gt:0'],
            'tanggal_target' => ['nullable', 'date_format:Y-m-d'],
            'ikon'           => ['nullable', 'string', 'max:50'],
            'warna'          => ['nullable', 'string', 'regex:/^#([a-fA-F0-0]{3}){1,2}$/'],
            'status'         => ['sometimes', Rule::in(['aktif', 'tercapai', 'dibatalkan'])],
            'catatan'        => ['nullable', 'string', 'max:500'],
        ];
    }
}

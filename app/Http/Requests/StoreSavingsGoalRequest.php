<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSavingsGoalRequest extends FormRequest
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
            'nama'           => ['required', 'string', 'max:150'],
            'target_nominal' => ['required', 'numeric', 'gt:0'],
            'tanggal_target' => ['nullable', 'date_format:Y-m-d'],
            'ikon'           => ['nullable', 'string', 'max:50'],
            'warna'          => ['nullable', 'string', 'regex:/^#([a-fA-F0-0]{3}){1,2}$/'],
            'catatan'        => ['nullable', 'string', 'max:500'],
        ];
    }
}

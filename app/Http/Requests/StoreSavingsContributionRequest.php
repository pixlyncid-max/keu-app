<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSavingsContributionRequest extends FormRequest
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
            'nominal' => ['required', 'numeric', 'gt:0'],
            'tanggal' => ['nullable', 'date_format:Y-m-d'],
            'catatan' => ['nullable', 'string', 'max:500'],
        ];
    }
}

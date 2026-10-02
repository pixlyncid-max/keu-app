<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRecurringRequest extends FormRequest
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
                'sometimes',
                'integer',
                Rule::exists('wallets', 'id')->where('user_id', $userId),
            ],
            'category_id' => [
                'sometimes',
                'integer',
                Rule::exists('categories', 'id')->where('user_id', $userId),
            ],
            'tipe'            => ['sometimes', Rule::in(['pemasukan', 'pengeluaran'])],
            'nominal'         => ['sometimes', 'numeric', 'gt:0'],
            'catatan'         => ['nullable', 'string', 'max:500'],
            'frekuensi'       => ['sometimes', Rule::in(['harian', 'mingguan', 'bulanan', 'tahunan'])],
            'interval'        => ['sometimes', 'integer', 'min:1', 'max:365'],
            'tanggal_mulai'   => ['sometimes', 'date_format:Y-m-d'],
            'tanggal_selesai' => ['nullable', 'date_format:Y-m-d'],
            'next_run_date'   => ['sometimes', 'date_format:Y-m-d'],
            'is_active'       => ['sometimes', 'boolean'],
        ];
    }
}

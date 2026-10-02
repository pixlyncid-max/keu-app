<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecurringRequest extends FormRequest
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
                'required',
                'integer',
                Rule::exists('wallets', 'id')->where('user_id', $userId),
            ],
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')->where('user_id', $userId),
            ],
            'tipe'            => ['required', Rule::in(['pemasukan', 'pengeluaran'])],
            'nominal'         => ['required', 'numeric', 'gt:0'],
            'catatan'         => ['nullable', 'string', 'max:500'],
            'frekuensi'       => ['required', Rule::in(['harian', 'mingguan', 'bulanan', 'tahunan'])],
            'interval'        => ['nullable', 'integer', 'min:1', 'max:365'],
            'tanggal_mulai'   => ['required', 'date_format:Y-m-d'],
            'tanggal_selesai' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:tanggal_mulai'],
            'next_run_date'   => ['nullable', 'date_format:Y-m-d'],
            'is_active'       => ['nullable', 'boolean'],
        ];
    }
}

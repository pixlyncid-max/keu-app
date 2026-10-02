<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('jumlah') && ! $this->has('nominal')) {
            $this->merge([
                'nominal' => $this->input('jumlah'),
            ]);
        }
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'wallet_id'   => [
                'sometimes', 'integer',
                "exists:wallets,id,user_id,{$userId},is_archived,0",
            ],
            'category_id' => [
                'sometimes', 'integer',
                "exists:categories,id,user_id,{$userId}",
            ],
            'tipe'    => ['sometimes', 'in:pemasukan,pengeluaran'],
            'nominal' => ['sometimes', 'numeric', 'min:0.01'],
            'tanggal' => ['sometimes', 'date_format:Y-m-d'],
            'catatan' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'wallet_id.exists'   => 'Dompet tidak ditemukan atau sudah diarsipkan.',
            'category_id.exists' => 'Kategori tidak ditemukan.',
            'tipe.in'            => 'Tipe transaksi harus "pemasukan" atau "pengeluaran".',
            'nominal.min'        => 'Nominal harus lebih dari 0.',
            'tanggal.date_format'=> 'Format tanggal harus YYYY-MM-DD.',
        ];
    }
}

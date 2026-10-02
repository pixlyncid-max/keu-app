<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
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
                'required', 'integer',
                "exists:wallets,id,user_id,{$userId},is_archived,0",
            ],
            'category_id' => [
                'required', 'integer',
                "exists:categories,id,user_id,{$userId}",
            ],
            'tipe'        => ['required', 'in:pemasukan,pengeluaran'],
            'nominal'     => ['required', 'numeric', 'min:0.01'],
            'tanggal'     => ['required', 'date_format:Y-m-d'],
            'catatan'     => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'wallet_id.required'   => 'Dompet wajib dipilih.',
            'wallet_id.exists'     => 'Dompet tidak ditemukan atau sudah diarsipkan.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists'   => 'Kategori tidak ditemukan.',
            'tipe.required'        => 'Tipe transaksi wajib dipilih.',
            'tipe.in'              => 'Tipe transaksi harus "pemasukan" atau "pengeluaran".',
            'nominal.required'     => 'Nominal wajib diisi.',
            'nominal.min'          => 'Nominal harus lebih dari 0.',
            'tanggal.required'     => 'Tanggal transaksi wajib diisi.',
            'tanggal.date_format'  => 'Format tanggal harus YYYY-MM-DD.',
        ];
    }
}

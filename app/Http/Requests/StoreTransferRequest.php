<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'dari_wallet_id' => [
                'required', 'integer',
                "exists:wallets,id,user_id,{$userId},is_archived,0",
            ],
            'ke_wallet_id' => [
                'required', 'integer',
                "exists:wallets,id,user_id,{$userId},is_archived,0",
                'different:dari_wallet_id',   // Tidak boleh transfer ke dompet yang sama
            ],
            'nominal'      => ['required', 'numeric', 'min:0.01'],
            'biaya_admin'  => ['nullable', 'numeric', 'min:0'],
            'tanggal'      => ['required', 'date_format:Y-m-d'],
            'catatan'      => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'dari_wallet_id.required'  => 'Dompet asal wajib dipilih.',
            'dari_wallet_id.exists'    => 'Dompet asal tidak ditemukan atau sudah diarsipkan.',
            'ke_wallet_id.required'    => 'Dompet tujuan wajib dipilih.',
            'ke_wallet_id.exists'      => 'Dompet tujuan tidak ditemukan atau sudah diarsipkan.',
            'ke_wallet_id.different'   => 'Dompet tujuan tidak boleh sama dengan dompet asal.',
            'nominal.required'         => 'Nominal transfer wajib diisi.',
            'nominal.min'              => 'Nominal transfer harus lebih dari 0.',
            'biaya_admin.min'          => 'Biaya admin tidak boleh negatif.',
            'tanggal.required'         => 'Tanggal transfer wajib diisi.',
            'tanggal.date_format'      => 'Format tanggal harus YYYY-MM-DD.',
        ];
    }
}

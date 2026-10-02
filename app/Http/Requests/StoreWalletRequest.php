<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama'       => ['required', 'string', 'max:100'],
            'tipe'       => ['required', 'in:tunai,bank,e-wallet'],
            'saldo_awal' => ['nullable', 'numeric', 'min:0'],
            'warna'      => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'ikon'       => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required'    => 'Nama dompet wajib diisi.',
            'tipe.required'    => 'Tipe dompet wajib dipilih.',
            'tipe.in'          => 'Tipe dompet harus salah satu dari: tunai, bank, e-wallet.',
            'saldo_awal.min'   => 'Saldo awal tidak boleh negatif.',
            'warna.regex'      => 'Format warna tidak valid. Gunakan hex color (contoh: #6366f1).',
        ];
    }
}

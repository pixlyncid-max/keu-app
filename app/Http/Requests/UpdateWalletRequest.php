<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama'        => ['sometimes', 'string', 'max:100'],
            'tipe'        => ['sometimes', 'in:tunai,bank,e-wallet'],
            'saldo_awal'  => ['sometimes', 'numeric', 'min:0'],
            'warna'       => ['sometimes', 'nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'ikon'        => ['sometimes', 'nullable', 'string', 'max:50'],
            'is_archived' => ['sometimes', 'boolean'],
            'urutan'      => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'tipe.in'        => 'Tipe dompet harus salah satu dari: tunai, bank, e-wallet.',
            'saldo_awal.min' => 'Saldo awal tidak boleh negatif.',
            'warna.regex'    => 'Format warna tidak valid. Gunakan hex color (contoh: #6366f1).',
        ];
    }
}

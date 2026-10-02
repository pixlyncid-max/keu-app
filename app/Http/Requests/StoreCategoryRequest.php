<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama'  => ['required', 'string', 'max:100'],
            'tipe'  => ['required', 'in:pemasukan,pengeluaran'],
            'ikon'  => ['nullable', 'string', 'max:50'],
            'warna' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required' => 'Nama kategori wajib diisi.',
            'tipe.required' => 'Tipe kategori wajib dipilih.',
            'tipe.in'       => 'Tipe kategori harus "pemasukan" atau "pengeluaran".',
            'warna.regex'   => 'Format warna tidak valid. Gunakan hex color (contoh: #6366f1).',
        ];
    }
}

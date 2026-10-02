<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama'   => ['sometimes', 'string', 'max:100'],
            'ikon'   => ['sometimes', 'nullable', 'string', 'max:50'],
            'warna'  => ['sometimes', 'nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'urutan' => ['sometimes', 'integer', 'min:0'],
            // Catatan: tipe tidak boleh diubah setelah dibuat
        ];
    }

    public function messages(): array
    {
        return [
            'warna.regex' => 'Format warna tidak valid. Gunakan hex color (contoh: #6366f1).',
        ];
    }
}

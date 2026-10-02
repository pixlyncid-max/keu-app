<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportJsonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:json', 'max:10240'], // Maksimal 10MB
            'mode_overwrite' => ['nullable', 'boolean'],
        ];
    }
}

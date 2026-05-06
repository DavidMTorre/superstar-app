<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePeliculaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['sometimes', 'required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'categoria' => ['sometimes', 'required', 'string', 'max:100'],
            'duracion' => ['sometimes', 'required', 'integer', 'min:1', 'max:600'],
            'imagen_url' => ['nullable', 'string', 'max:2048'],
            'estado' => ['sometimes', 'required', 'string', 'in:disponible,no_disponible'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}

<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StorePeliculaRequest extends FormRequest
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
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'categoria' => ['required', 'string', 'max:100'],
            'duracion' => ['required', 'integer', 'min:1', 'max:600'],
            'imagen_url' => ['nullable', 'string', 'max:2048'],
            'estado' => ['required', 'string', 'in:disponible,no_disponible'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'titulo.required' => 'El título es obligatorio.',
            'categoria.required' => 'La categoría es obligatoria.',
            'duracion.required' => 'La duración es obligatoria.',
            'estado.in' => 'El estado debe ser disponible o no_disponible.',
        ];
    }
}

<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalaRequest extends FormRequest
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
            'nombre' => ['required', 'string', 'max:255'],
            'estado' => ['required', 'string', 'in:disponible,inactiva'],
            'precio' => ['required', 'numeric', 'min:0'],
            'tiempo_limpieza' => ['required', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la sala es obligatorio.',
            'estado.in' => 'El estado debe ser disponible o inactiva.',
            'precio.required' => 'El precio es obligatorio.',
            'precio.min' => 'El precio no puede ser negativo.',
            'tiempo_limpieza.required' => 'El tiempo de limpieza es obligatorio.',
            'tiempo_limpieza.min' => 'El tiempo de limpieza no puede ser negativo.',
        ];
    }
}

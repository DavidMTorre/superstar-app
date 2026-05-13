<?php

namespace App\Http\Requests\Api\V1\Perfil;

use App\Http\Requests\Api\ApiFormRequest;

class CambiarPasswordRequest extends ApiFormRequest
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
            'password_actual' => ['required', 'string'],
            'password_nueva' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'password_actual.required' => 'La contraseña actual es obligatoria.',
            'password_nueva.required' => 'La nueva contraseña es obligatoria.',
            'password_nueva.min' => 'La nueva contraseña debe tener al menos 8 caracteres.',
            'password_nueva.confirmed' => 'La confirmación de la nueva contraseña no coincide.',
        ];
    }
}

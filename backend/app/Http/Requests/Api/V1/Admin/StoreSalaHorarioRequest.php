<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalaHorarioRequest extends FormRequest
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
            'dia_semana' => ['required', 'integer', 'between:0,6'],
            'hora_apertura' => ['required', 'string', 'max:8'],
            'hora_cierre' => ['required', 'string', 'max:8'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}

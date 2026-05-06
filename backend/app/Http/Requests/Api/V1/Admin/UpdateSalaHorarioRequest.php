<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalaHorarioRequest extends FormRequest
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
            'hora_apertura' => ['sometimes', 'required_with:hora_cierre', 'string', 'max:8'],
            'hora_cierre' => ['sometimes', 'required_with:hora_apertura', 'string', 'max:8'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}

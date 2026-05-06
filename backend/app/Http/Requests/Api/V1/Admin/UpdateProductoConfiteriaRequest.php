<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Http\Requests\Api\ApiFormRequest;
use Illuminate\Validation\Rule;

class UpdateProductoConfiteriaRequest extends ApiFormRequest
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
            'descripcion' => ['sometimes', 'nullable', 'string'],
            'precio' => ['required', 'numeric', 'min:0'],
            'imagen_url' => ['sometimes', 'nullable', 'string'],
            'estado' => ['sometimes', 'nullable', Rule::in(['disponible', 'agotado'])],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}

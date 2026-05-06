<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Http\Requests\Api\ApiFormRequest;
use Illuminate\Validation\Rule;

class UpdateComboRequest extends ApiFormRequest
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
            'nombre' => ['sometimes', 'required', 'string', 'max:255'],
            'precio' => ['sometimes', 'required', 'numeric', 'min:0'],
            'estado' => ['sometimes', 'nullable', Rule::in(['disponible', 'agotado'])],
            'productos' => ['sometimes', 'required', 'array', 'min:1'],
            'productos.*.producto_id' => ['required_with:productos', 'integer', Rule::exists('productos_confiteria', 'id')],
            'productos.*.cantidad' => ['required_with:productos', 'integer', 'min:1'],
        ];
    }
}

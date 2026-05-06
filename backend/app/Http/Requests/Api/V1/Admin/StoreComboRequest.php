<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Http\Requests\Api\ApiFormRequest;
use Illuminate\Validation\Rule;

class StoreComboRequest extends ApiFormRequest
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
            'precio' => ['required', 'numeric', 'min:0'],
            'estado' => ['nullable', Rule::in(['disponible', 'agotado'])],
            'productos' => ['required', 'array', 'min:1'],
            'productos.*.producto_id' => ['required', 'integer', Rule::exists('productos_confiteria', 'id')],
            'productos.*.cantidad' => ['required', 'integer', 'min:1'],
        ];
    }
}

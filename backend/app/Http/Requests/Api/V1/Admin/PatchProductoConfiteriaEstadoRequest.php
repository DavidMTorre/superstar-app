<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Http\Requests\Api\ApiFormRequest;
use Illuminate\Validation\Rule;

class PatchProductoConfiteriaEstadoRequest extends ApiFormRequest
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
            'estado' => ['required', Rule::in(['disponible', 'agotado'])],
        ];
    }
}

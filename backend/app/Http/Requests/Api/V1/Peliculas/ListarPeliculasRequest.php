<?php

namespace App\Http\Requests\Api\V1\Peliculas;

use App\Http\Requests\Api\ApiFormRequest;

class ListarPeliculasRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'buscar' => $this->query('buscar'),
            'categoria' => $this->query('categoria'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'buscar' => ['nullable', 'string', 'max:255'],
            'categoria' => ['nullable', 'string', 'max:100'],
        ];
    }
}

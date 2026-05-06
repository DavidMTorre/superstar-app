<?php

namespace App\Http\Requests\Api\V1\Disponibilidad;

use App\Http\Requests\Api\ApiFormRequest;

class ListarDisponibilidadRequest extends ApiFormRequest
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
            'pelicula_id' => ['required', 'integer', 'exists:peliculas,id'],
            'fecha' => ['required', 'date_format:Y-m-d'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pelicula_id.required' => 'Debe indicar la película.',
            'pelicula_id.exists' => 'La película no existe.',
            'fecha.required' => 'Debe indicar la fecha.',
            'fecha.date_format' => 'La fecha debe tener formato Y-m-d.',
        ];
    }
}

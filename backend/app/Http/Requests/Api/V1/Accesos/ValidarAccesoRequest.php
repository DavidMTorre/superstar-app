<?php

namespace App\Http\Requests\Api\V1\Accesos;

use App\Http\Requests\Api\ApiFormRequest;

class ValidarAccesoRequest extends ApiFormRequest
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
            'codigo_qr' => ['required', 'string', 'min:1', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'codigo_qr.required' => 'El código QR es obligatorio.',
            'codigo_qr.min' => 'El código QR no es válido.',
        ];
    }

    /**
     * @return array{codigo_qr: string}
     */
    public function datosValidacion(): array
    {
        /** @var array{codigo_qr: string} $v */
        $v = $this->validated();

        return $v;
    }
}

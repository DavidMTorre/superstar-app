<?php

namespace App\Http\Requests\Api\V1\Tickets;

use App\Http\Requests\Api\ApiFormRequest;

class ValidarTicketRequest extends ApiFormRequest
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
            'token_qr' => ['required', 'string', 'min:8', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'token_qr.required' => 'El token del ticket es obligatorio.',
            'token_qr.min' => 'El token del ticket no es válido.',
        ];
    }

    /**
     * @return array{token_qr: string}
     */
    public function datosValidacion(): array
    {
        /** @var array{token_qr: string} $v */
        $v = $this->validated();

        return [
            'token_qr' => trim($v['token_qr']),
        ];
    }
}

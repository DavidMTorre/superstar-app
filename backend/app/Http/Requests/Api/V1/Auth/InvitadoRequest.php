<?php

namespace App\Http\Requests\Api\V1\Auth;

use App\Http\Requests\Api\ApiFormRequest;

class InvitadoRequest extends ApiFormRequest
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
        return [];
    }
}

<?php

namespace App\Http\Requests\Api\V1\Pagos;

use App\Http\Requests\Api\ApiFormRequest;
use Illuminate\Validation\Rule;

class RealizarPagoRequest extends ApiFormRequest
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
            'codigo_reserva' => ['required', 'uuid', Rule::exists('reservas', 'codigo_reserva')],
            'metodo_pago' => ['required', 'string', Rule::in(['yape', 'plin', 'tarjeta', 'efectivo'])],
            'monto' => ['required', 'numeric', 'min:0.01'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'codigo_reserva.required' => 'El código de reserva es obligatorio.',
            'codigo_reserva.uuid' => 'El código de reserva no es válido.',
            'codigo_reserva.exists' => 'No existe una reserva con el código indicado.',
            'metodo_pago.required' => 'El método de pago es obligatorio.',
            'metodo_pago.in' => 'El método de pago debe ser: yape, plin, tarjeta o efectivo.',
            'monto.required' => 'El monto es obligatorio.',
            'monto.min' => 'El monto debe ser mayor que cero.',
        ];
    }

    /**
     * @return array{codigo_reserva: string, metodo_pago: string, monto: float|string}
     */
    public function datosPago(): array
    {
        /** @var array{codigo_reserva: string, metodo_pago: string, monto: float|string} $v */
        $v = $this->validated();

        return $v;
    }
}

<?php

namespace App\Http\Requests\Api\V1\Confiteria;

use App\Http\Requests\Api\ApiFormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

class ConfiteriaAgregarRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'productos' => $this->input('productos', []),
            'combos' => $this->input('combos', []),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'codigo_reserva' => ['required', 'uuid', Rule::exists('reservas', 'codigo_reserva')],
            'productos' => ['nullable', 'array'],
            'productos.*.producto_id' => ['required', 'integer', Rule::exists('productos_confiteria', 'id')],
            'productos.*.cantidad' => ['required', 'integer', 'min:1'],
            'combos' => ['nullable', 'array'],
            'combos.*.combo_id' => ['required', 'integer', Rule::exists('combos', 'id')],
            'combos.*.cantidad' => ['required', 'integer', 'min:1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            /** @var array<int, mixed>|null $productos */
            $productos = $this->input('productos');
            /** @var array<int, mixed>|null $combos */
            $combos = $this->input('combos');
            $productos = is_array($productos) ? $productos : [];
            $combos = is_array($combos) ? $combos : [];

            if ($productos === [] && $combos === []) {
                $v->errors()->add('productos', 'Debes indicar al menos un producto o un combo.');
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'codigo_reserva.required' => 'El código de reserva es obligatorio.',
            'productos.*.producto_id.exists' => 'Un producto no es válido.',
            'productos.*.cantidad.min' => 'La cantidad debe ser al menos 1.',
            'combos.*.combo_id.exists' => 'Un combo no es válido.',
            'combos.*.cantidad.min' => 'La cantidad del combo debe ser al menos 1.',
        ];
    }

    /**
     * @return array{
     *     codigo_reserva: string,
     *     productos: list<array{producto_id: int, cantidad: int}>,
     *     combos: list<array{combo_id: int, cantidad: int}>
     * }
     */
    public function datosAgregar(): array
    {
        /** @var array{codigo_reserva: string, productos?: array, combos?: array} $v */
        $v = $this->validated();

        /** @var list<array{producto_id: int, cantidad: int}> $productosList */
        $productosList = isset($v['productos']) && is_array($v['productos']) ? $v['productos'] : [];
        /** @var list<array{combo_id: int, cantidad: int}> $combosList */
        $combosList = isset($v['combos']) && is_array($v['combos']) ? $v['combos'] : [];

        return [
            'codigo_reserva' => $v['codigo_reserva'],
            'productos' => $productosList,
            'combos' => $combosList,
        ];
    }
}

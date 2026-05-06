<?php

namespace App\Http\Requests\Api\V1\Reservas;

use App\Http\Requests\Api\ApiFormRequest;
use Illuminate\Contracts\Validation\Validator;

class CrearReservaRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('guest_id') && is_string($this->input('guest_id'))) {
            $this->merge([
                'guest_id' => trim($this->input('guest_id')),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'usuario_id' => ['nullable', 'integer', 'exists:users,id'],
            'guest_id' => ['nullable', 'string', 'max:191'],
            'pelicula_id' => ['required', 'integer', 'exists:peliculas,id'],
            'sala_id' => ['required', 'integer', 'exists:salas,id'],
            'fecha' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'hora_inicio' => ['required', 'string', 'regex:/^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/'],
            'cantidad_personas' => ['required', 'integer', 'min:1', 'max:4'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $uid = $this->input('usuario_id');
            $gid = $this->input('guest_id');

            $tieneUsuario = $uid !== null && $uid !== '';
            $tieneGuest = is_string($gid) && $gid !== '';

            if ($tieneUsuario && $tieneGuest) {
                $validator->errors()->add(
                    'usuario_id',
                    'Debe indicar usuario registrado o sesión de invitado, no ambos.'
                );
            }

            if (! $tieneUsuario && ! $tieneGuest) {
                $validator->errors()->add(
                    'usuario_id',
                    'Debe enviar usuario_id (registrado) o guest_id (invitado).'
                );
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pelicula_id.required' => 'Debe indicar la película.',
            'pelicula_id.exists' => 'La película indicada no existe.',
            'sala_id.required' => 'Debe elegir una sala.',
            'sala_id.exists' => 'La sala indicada no existe.',
            'fecha.required' => 'Indica la fecha de la función.',
            'fecha.after_or_equal' => 'La fecha no puede ser anterior a hoy.',
            'hora_inicio.required' => 'Indica la hora de inicio.',
            'hora_inicio.regex' => 'La hora de inicio debe tener formato HH:MM o HH:MM:SS.',
            'cantidad_personas.required' => 'La cantidad de personas es obligatoria.',
            'cantidad_personas.max' => 'El máximo es 4 personas por reserva.',
            'cantidad_personas.min' => 'Debe reservar al menos 1 persona.',
            'usuario_id.exists' => 'El usuario indicado no existe.',
        ];
    }

    /**
     * @return array{
     *     pelicula_id: int,
     *     sala_id: int,
     *     fecha: string,
     *     hora_inicio: string,
     *     cantidad_personas: int,
     *     usuario_id?: int,
     *     guest_id?: string
     * }
     */
    public function datosReserva(): array
    {
        /** @var array<string, mixed> $v */
        $v = $this->validated();

        $datos = [
            'pelicula_id' => (int) $v['pelicula_id'],
            'sala_id' => (int) $v['sala_id'],
            'fecha' => (string) $v['fecha'],
            'hora_inicio' => (string) $v['hora_inicio'],
            'cantidad_personas' => (int) $v['cantidad_personas'],
        ];

        if (isset($v['usuario_id']) && $v['usuario_id'] !== null && $v['usuario_id'] !== '') {
            $datos['usuario_id'] = (int) $v['usuario_id'];
        }

        if (isset($v['guest_id']) && is_string($v['guest_id']) && $v['guest_id'] !== '') {
            $datos['guest_id'] = $v['guest_id'];
        }

        return $datos;
    }
}

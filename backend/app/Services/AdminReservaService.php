<?php

namespace App\Services;

use App\Models\Pago;
use App\Models\Reserva;
use App\Models\User;
use App\Repositories\ReservaRepository;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AdminReservaService
{
    public function __construct(
        private readonly ReservaRepository $reservaRepository
    ) {}

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function listar(
        ?string $estadoReserva,
        ?string $estadoPago,
        ?string $fechaDesde,
        ?string $fechaHasta
    ): Collection {
        return $this->reservaRepository
            ->listarParaAdmin($estadoReserva, $estadoPago, $fechaDesde, $fechaHasta)
            ->map(fn (Reserva $r) => $this->serializar($r));
    }

    /**
     * @return array<string, mixed>
     */
    private function serializar(Reserva $reserva): array
    {
        /** @var User|null $user */
        $user = $reserva->user;
        /** @var Pago|null $pago */
        $pago = $reserva->pago;

        $fechaFuncion = $reserva->fecha !== null
            ? $reserva->fecha->format('Y-m-d')
            : '';

        $horaRaw = $reserva->hora_inicio;
        $horaFuncion = is_string($horaRaw)
            ? substr($horaRaw, 0, 8)
            : Carbon::parse($horaRaw)->format('H:i:s');

        return [
            'id' => $reserva->id,
            'codigo_reserva' => $reserva->codigo_reserva,
            'estado_reserva' => $reserva->estado,
            'fecha_funcion' => $fechaFuncion,
            'hora_funcion' => $horaFuncion,
            'sala' => $reserva->sala?->nombre,
            'cantidad_personas' => $reserva->cantidad_personas,
            'precio_total' => $reserva->precio_total !== null ? (string) $reserva->precio_total : null,
            'guest_id' => $reserva->guest_id,
            'usuario' => $user === null ? null : [
                'id' => $user->id,
                'nombre' => $user->name,
                'correo' => $user->email,
            ],
            'pelicula' => $reserva->pelicula === null ? null : [
                'id' => $reserva->pelicula->id,
                'titulo' => $reserva->pelicula->titulo,
            ],
            'pago' => $pago === null ? null : [
                'estado' => $pago->estado,
                'monto' => (string) $pago->monto,
                'metodo_pago' => $pago->metodo_pago,
                'fecha_pago' => $pago->fecha_pago?->toIso8601String(),
            ],
            'created_at' => $reserva->created_at?->toIso8601String(),
        ];
    }
}

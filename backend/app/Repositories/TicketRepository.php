<?php

namespace App\Repositories;

use App\Models\Reserva;
use Illuminate\Support\Facades\DB;

class TicketRepository
{
    /**
     * Busca reserva por token en columna `token_qr` o vía pago legado.
     *
     * @param  list<string>  $relaciones
     */
    public function buscarReservaPorToken(string $token, array $relaciones = []): ?Reserva
    {
        $token = trim($token);

        if ($token === '') {
            return null;
        }

        $directo = Reserva::query()
            ->with($relaciones)
            ->where('token_qr', $token)
            ->first();

        if ($directo !== null) {
            return $directo;
        }

        return Reserva::query()
            ->with(array_merge($relaciones, ['pago']))
            ->whereHas('pago', function ($q) use ($token): void {
                $q->where('codigo_ticket_qr', $token);
            })
            ->first();
    }

    /**
     * Bloqueo pesimista para marcar ingreso sin condiciones de carrera.
     */
    public function bloquearReservaPorId(int $reservaId): ?Reserva
    {
        /** @var Reserva|null $r */
        $r = Reserva::query()->whereKey($reservaId)->lockForUpdate()->first();

        return $r;
    }

    /**
     * Actualiza campos de uso de ticket (compatible con flujo previo `fecha_uso_acceso`).
     */
    public function registrarIngreso(Reserva $reserva): void
    {
        $reserva->estado = 'utilizada';
        $reserva->fecha_uso_acceso = now();
        $reserva->ticket_usado = true;
        $reserva->hora_ingreso = now();
        $reserva->save();
    }

    /**
     * @param  callable(): mixed  $callback
     * @return mixed
     */
    public function transaccion(callable $callback): mixed
    {
        return DB::transaction($callback);
    }
}

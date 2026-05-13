<?php

namespace App\Repositories;

use App\Models\Reserva;
use Illuminate\Support\Collection;

class ReservaRepository
{
    public function contar(): int
    {
        return Reserva::query()->count();
    }

    public function sumarIngresosEntradas(): float
    {
        return (float) Reserva::query()->sum('precio_total');
    }

    /**
     * Suma de precio_total agrupada por día de creación de la reserva.
     *
     * @return Collection<int, object{fecha: string, total: string}>
     */
    public function ventasPorDia(): Collection
    {
        return Reserva::query()
            ->selectRaw('date(created_at) as fecha')
            ->selectRaw('sum(precio_total) as total')
            ->groupByRaw('date(created_at)')
            ->orderBy('fecha')
            ->get();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): Reserva
    {
        return Reserva::query()->create($attributes);
    }

    public function buscarPorCodigoReserva(string $codigoReserva): ?Reserva
    {
        return Reserva::query()->where('codigo_reserva', $codigoReserva)->first();
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    public function actualizarMetadata(Reserva $reserva, array $metadata): void
    {
        $actual = $reserva->metadata ?? [];
        $reserva->metadata = array_merge($actual, $metadata);
        $reserva->save();
    }

    public function contarPorPelicula(int $peliculaId): int
    {
        return Reserva::query()->where('pelicula_id', $peliculaId)->count();
    }

    public function contarTotal(): int
    {
        return Reserva::query()->count();
    }

    /**
     * Solapamiento de intervalos [hora_inicio, hora_fin) en la misma sala y fecha.
     */
    public function existeSolapamiento(
        int $salaId,
        string $fechaYmd,
        string $horaInicioHis,
        string $horaFinHis,
        ?int $excluirReservaId = null
    ): bool {
        $q = Reserva::query()
            ->where('sala_id', $salaId)
            ->whereDate('fecha', $fechaYmd)
            ->where(function ($q) use ($horaInicioHis, $horaFinHis): void {
                $q->where('hora_inicio', '<', $horaFinHis)
                    ->where('hora_fin', '>', $horaInicioHis);
            });

        if ($excluirReservaId !== null) {
            $q->whereKeyNot($excluirReservaId);
        }

        return $q->exists();
    }

    /**
     * Reservas de una sala en una fecha (intervalos ocupados).
     *
     * @return Collection<int, Reserva>
     */
    public function obtenerReservasPorSalaYFecha(int $salaId, string $fechaYmd): Collection
    {
        return Reserva::query()
            ->where('sala_id', $salaId)
            ->whereDate('fecha', $fechaYmd)
            ->orderBy('hora_inicio')
            ->get(['hora_inicio', 'hora_fin']);
    }

    /**
     * @param  list<int>  $salaIds
     * @return Collection<int, Collection<int, Reserva>>
     */
    public function obtenerReservasPorSalasYFecha(array $salaIds, string $fechaYmd): Collection
    {
        if ($salaIds === []) {
            return collect();
        }

        return Reserva::query()
            ->whereIn('sala_id', $salaIds)
            ->whereDate('fecha', $fechaYmd)
            ->orderBy('sala_id')
            ->orderBy('hora_inicio')
            ->get(['sala_id', 'hora_inicio', 'hora_fin'])
            ->groupBy('sala_id')
            ->map(fn (Collection $grupo) => $grupo->values());
    }

    /**
     * Listado administrativo con relaciones y filtros opcionales.
     *
     * @return Collection<int, Reserva>
     */
    public function listarParaAdmin(
        ?string $estadoReserva,
        ?string $estadoPago,
        ?string $fechaDesde,
        ?string $fechaHasta
    ): Collection {
        $q = Reserva::query()
            ->with(['user', 'pelicula', 'pago', 'sala'])
            ->orderByDesc('created_at');

        if ($estadoReserva !== null && $estadoReserva !== '') {
            $q->where('estado', $estadoReserva);
        }

        if ($fechaDesde !== null && $fechaDesde !== '') {
            $q->whereDate('fecha', '>=', $fechaDesde);
        }

        if ($fechaHasta !== null && $fechaHasta !== '') {
            $q->whereDate('fecha', '<=', $fechaHasta);
        }

        if ($estadoPago !== null && $estadoPago !== '') {
            if ($estadoPago === 'sin_pago') {
                $q->whereDoesntHave('pago');
            } else {
                $q->whereHas('pago', function ($pq) use ($estadoPago): void {
                    $pq->where('estado', $estadoPago);
                });
            }
        }

        return $q->get();
    }

    /**
     * Reservas de un usuario registrado con relaciones para perfil / historial.
     *
     * @return Collection<int, Reserva>
     */
    /**
     * Persiste el token QR del ticket en la reserva (tras pago exitoso).
     */
    public function asignarTokenQr(Reserva $reserva, string $tokenQr): void
    {
        $reserva->token_qr = $tokenQr;
        $reserva->save();
    }

    public function listarPorUsuario(int $userId): Collection
    {
        return Reserva::query()
            ->where('user_id', $userId)
            ->with([
                'pelicula',
                'sala',
                'pago',
                'reservaProductos.producto',
            ])
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->get();
    }
}

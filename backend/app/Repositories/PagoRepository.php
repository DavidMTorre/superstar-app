<?php

namespace App\Repositories;

use App\Models\Pago;

class PagoRepository
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function crear(array $attributes): Pago
    {
        return Pago::query()->create($attributes);
    }

    public function existePagoParaReserva(int $reservaId): bool
    {
        return Pago::query()->where('reserva_id', $reservaId)->exists();
    }
}

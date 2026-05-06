<?php

namespace App\Repositories;

use App\Models\Pago;
use App\Models\Reserva;

class AccesoRepository
{
    public function buscarPagoPorCodigoTicketQr(string $codigoQr): ?Pago
    {
        $codigoQr = trim($codigoQr);

        if ($codigoQr === '') {
            return null;
        }

        return Pago::query()->with('reserva')->where('codigo_ticket_qr', $codigoQr)->first();
    }

    public function registrarIngreso(Reserva $reserva): void
    {
        $reserva->estado = 'utilizada';
        $reserva->fecha_uso_acceso = now();
        $reserva->save();
    }
}

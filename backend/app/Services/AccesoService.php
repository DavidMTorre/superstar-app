<?php

namespace App\Services;

use App\Exceptions\TicketYaUsadoException;
use App\Models\Reserva;
use App\Repositories\AccesoRepository;
use App\Support\TicketQr;
use Illuminate\Support\Facades\DB;

class AccesoService
{
    public function __construct(
        private readonly AccesoRepository $accesoRepository
    ) {}

    /**
     * @param  array{codigo_qr: string}  $datos
     * @return array{ok: true}|array{ok: false, mensaje: string}
     */
    public function validarAcceso(array $datos): array
    {
        $codigoQr = trim($datos['codigo_qr']);

        $pago = $this->accesoRepository->buscarPagoPorCodigoTicketQr($codigoQr);

        if ($pago === null) {
            return ['ok' => false, 'mensaje' => 'QR inválido.'];
        }

        $reserva = $pago->reserva;

        if ($reserva === null) {
            return ['ok' => false, 'mensaje' => 'Reserva no encontrada.'];
        }

        if (! TicketQr::coincide($reserva, $codigoQr)) {
            return ['ok' => false, 'mensaje' => 'QR inválido.'];
        }

        if ($pago->estado !== 'pagado') {
            return ['ok' => false, 'mensaje' => 'La reserva no está pagada.'];
        }

        if (($reserva->metadata['pago_estado'] ?? '') !== 'pagado') {
            return ['ok' => false, 'mensaje' => 'La reserva no está pagada.'];
        }

        if ($reserva->fecha_uso_acceso !== null || $reserva->estado === 'utilizada') {
            return ['ok' => false, 'mensaje' => 'Este ticket ya fue utilizado.'];
        }

        try {
            DB::transaction(function () use ($reserva): void {
                $bloqueada = Reserva::query()->whereKey($reserva->id)->lockForUpdate()->first();

                if ($bloqueada === null) {
                    throw new TicketYaUsadoException;
                }

                if ($bloqueada->fecha_uso_acceso !== null || $bloqueada->estado === 'utilizada') {
                    throw new TicketYaUsadoException;
                }

                $this->accesoRepository->registrarIngreso($bloqueada);
            });
        } catch (TicketYaUsadoException) {
            return ['ok' => false, 'mensaje' => 'Este ticket ya fue utilizado.'];
        }

        return ['ok' => true];
    }
}

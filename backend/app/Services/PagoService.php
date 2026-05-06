<?php

namespace App\Services;

use App\Models\Pago;
use App\Models\Reserva;
use App\Repositories\PagoRepository;
use App\Repositories\ReservaRepository;
use App\Support\TicketQr;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class PagoService
{
    public function __construct(
        private readonly ReservaRepository $reservaRepository,
        private readonly PagoRepository $pagoRepository
    ) {}

    /**
     * @param  array{codigo_reserva: string, metodo_pago: string, monto: float|string}  $datos
     * @return array{
     *     ok: true,
     *     pago: array<string, mixed>,
     *     ticket: array{codigo_qr: string}
     * }|array{ok: false, mensaje: string}
     */
    public function realizarPago(array $datos): array
    {
        $reserva = $this->reservaRepository->buscarPorCodigoReserva($datos['codigo_reserva']);

        if ($reserva === null) {
            return [
                'ok' => false,
                'mensaje' => 'No existe una reserva con el código indicado.',
            ];
        }

        if ($this->pagoRepository->existePagoParaReserva((int) $reserva->id)) {
            return [
                'ok' => false,
                'mensaje' => 'Esta reserva ya tiene un pago registrado.',
            ];
        }

        $monto = is_string($datos['monto']) ? (float) $datos['monto'] : $datos['monto'];

        try {
            /** @var Pago $pago */
            $pago = DB::transaction(function () use ($reserva, $datos, $monto): Pago {
                $codigoTicketQr = TicketQr::generar($reserva);

                $pago = $this->pagoRepository->crear([
                    'reserva_id' => $reserva->id,
                    'metodo_pago' => $datos['metodo_pago'],
                    'estado' => 'pagado',
                    'monto' => number_format($monto, 2, '.', ''),
                    'fecha_pago' => now(),
                    'codigo_ticket_qr' => $codigoTicketQr,
                ]);

                $this->reservaRepository->actualizarMetadata($reserva, [
                    'pago_estado' => 'pagado',
                ]);

                return $pago;
            });
        } catch (QueryException $exception) {
            if ($this->esViolacionUnicidad($exception)) {
                return [
                    'ok' => false,
                    'mensaje' => 'Esta reserva ya tiene un pago registrado.',
                ];
            }

            throw $exception;
        }

        return [
            'ok' => true,
            'pago' => $this->pagoPublico($pago),
            'ticket' => [
                'codigo_qr' => (string) $pago->codigo_ticket_qr,
            ],
        ];
    }

    private function esViolacionUnicidad(QueryException $exception): bool
    {
        $msg = strtolower($exception->getMessage());
        $driverCode = $exception->errorInfo[1] ?? null;

        return str_contains($msg, 'unique')
            || $driverCode === 1062
            || $driverCode === 19;
    }

    /**
     * @return array<string, mixed>
     */
    private function pagoPublico(Pago $pago): array
    {
        return [
            'id' => (int) $pago->id,
            'reserva_id' => (int) $pago->reserva_id,
            'metodo_pago' => $pago->metodo_pago,
            'estado' => $pago->estado,
            'monto' => (float) $pago->monto,
            'fecha_pago' => $pago->fecha_pago?->toIso8601String(),
        ];
    }
}

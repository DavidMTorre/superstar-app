<?php

namespace App\Services;

use App\Exceptions\TicketYaUsadoException;
use App\Models\Pago;
use App\Models\Reserva;
use App\Models\ReservaProducto;
use App\Repositories\TicketRepository;
use App\Support\TicketQr;
use Carbon\Carbon;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TicketService
{
    public function __construct(
        private readonly TicketRepository $ticketRepository
    ) {}

    /**
     * URL absoluta que codifica el QR (app cliente).
     */
    public function urlTicketCliente(string $token): string
    {
        $base = rtrim((string) config('app.frontend_url', ''), '/');

        return $base.'/ticket/'.rawurlencode($token);
    }

    /**
     * PNG base64 si existe ext-gd; si no, SVG base64 (compatible con &lt;img&gt;).
     *
     * @return non-empty-string
     */
    public function generarQrImagenDataUri(string $token): string
    {
        $url = $this->urlTicketCliente($token);

        if (extension_loaded('gd')) {
            /** @var string $binary */
            $binary = $this->generarContenidoQr('png', $url);

            return 'data:image/png;base64,'.base64_encode($binary);
        }

        /** @var string $svg */
        $svg = $this->generarContenidoQr('svg', $url);

        return 'data:image/svg+xml;base64,'.base64_encode($svg);
    }

    /**
     * Detalle público del ticket (sin datos sensibles del usuario más allá del nombre).
     *
     * @return array<string, mixed>|null
     */
    public function obtenerTicketPublico(string $token): ?array
    {
        $reserva = $this->ticketRepository->buscarReservaPorToken($token, [
            'pelicula',
            'sala',
            'pago',
            'reservaProductos.producto',
            'user',
        ]);

        if ($reserva === null) {
            return null;
        }

        $pago = $reserva->pago;
        if ($pago === null || $pago->estado !== 'pagado') {
            return null;
        }

        if (! TicketQr::coincide($reserva, $token)) {
            return null;
        }

        $tokenEfectivo = (string) ($reserva->token_qr ?? $pago->codigo_ticket_qr ?? '');
        if ($tokenEfectivo === '') {
            return null;
        }

        if (($reserva->metadata['pago_estado'] ?? '') !== 'pagado') {
            return null;
        }

        return $this->serializarTicketRespuesta($reserva, $pago, $tokenEfectivo);
    }

    /**
     * Validación empleado/admin + registro de ingreso.
     *
     * @return array{exito: bool, mensaje: string, datos: array<string, mixed>|null, codigo_http: int}
     */
    public function validarParaEmpleado(string $tokenQr): array
    {
        $tokenQr = trim($tokenQr);

        if ($tokenQr === '') {
            return $this->respuestaValidacion(false, 'Ticket inválido', null, 422);
        }

        $evaluacion = $this->evaluarEstadoTicket($tokenQr);
        $rechazoTemprano = $this->respuestaValidacionEmpleadoPorEvaluacion($evaluacion);
        if ($rechazoTemprano !== null) {
            return $rechazoTemprano;
        }

        /** @var Reserva $reserva */
        $reserva = $evaluacion['reserva'];

        try {
            $this->registrarIngresoEnTransaccion($reserva, true);
        } catch (TicketYaUsadoException) {
            return $this->respuestaValidacion(false, 'Ticket ya utilizado', null, 422);
        }

        $reserva->refresh();

        $datos = [
            'pelicula' => (string) ($reserva->pelicula?->titulo ?? ''),
            'sala' => (string) ($reserva->sala?->nombre ?? ''),
            'hora' => $this->formatoHoraCorta((string) $reserva->hora_inicio),
            'cliente' => (string) ($reserva->user?->name ?? 'Invitado'),
        ];

        return $this->respuestaValidacion(true, 'Acceso autorizado', $datos, 200);
    }

    /**
     * Compatibilidad con POST /api/v1/accesos/validar (mensajes históricos).
     *
     * @return array{ok: bool, mensaje: string}
     */
    public function validarParaAccesoLegacy(string $codigoQr): array
    {
        $codigoQr = trim($codigoQr);

        if ($codigoQr === '') {
            return ['ok' => false, 'mensaje' => 'QR inválido.'];
        }

        $evaluacion = $this->evaluarEstadoTicket($codigoQr);
        $rechazoTemprano = $this->respuestaLegacyPorEvaluacion($evaluacion);
        if ($rechazoTemprano !== null) {
            return $rechazoTemprano;
        }

        /** @var Reserva $reserva */
        $reserva = $evaluacion['reserva'];

        try {
            $this->registrarIngresoEnTransaccion($reserva, false);
        } catch (TicketYaUsadoException) {
            return ['ok' => false, 'mensaje' => 'Este ticket ya fue utilizado.'];
        }

        return ['ok' => true, 'mensaje' => 'Acceso permitido'];
    }

    /**
     * @return array{
     *     tipo: 'invalido'|'no_pagado'|'usado'|'expirado'|'valido',
     *     reserva?: Reserva,
     *     pago?: Pago|null
     * }
     */
    private function evaluarEstadoTicket(string $codigoQr): array
    {
        $reserva = $this->ticketRepository->buscarReservaPorToken($codigoQr, [
            'pelicula',
            'sala',
            'pago',
            'user',
        ]);

        if ($reserva === null) {
            return ['tipo' => 'invalido'];
        }

        $pago = $reserva->pago;

        if ($pago === null || ! TicketQr::coincide($reserva, $codigoQr)) {
            return ['tipo' => 'invalido'];
        }

        if ($pago->estado !== 'pagado' || ($reserva->metadata['pago_estado'] ?? '') !== 'pagado') {
            return ['tipo' => 'no_pagado', 'reserva' => $reserva, 'pago' => $pago];
        }

        if ($reserva->ticket_usado || $reserva->fecha_uso_acceso !== null || $reserva->estado === 'utilizada') {
            return ['tipo' => 'usado', 'reserva' => $reserva, 'pago' => $pago];
        }

        if ($this->funcionYaFinalizo($reserva)) {
            return ['tipo' => 'expirado', 'reserva' => $reserva, 'pago' => $pago];
        }

        return ['tipo' => 'valido', 'reserva' => $reserva, 'pago' => $pago];
    }

    private function funcionYaFinalizo(Reserva $reserva): bool
    {
        $fecha = $this->formatoFechaReservaYmd($reserva);

        $horaFin = trim((string) $reserva->hora_fin);
        if ($horaFin === '') {
            return false;
        }

        try {
            $fin = Carbon::parse($fecha.' '.$horaFin);
        } catch (\Throwable) {
            return false;
        }

        return Carbon::now()->greaterThan($fin);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializarTicketRespuesta(Reserva $reserva, Pago $pago, string $tokenEfectivo): array
    {
        $subtotalConfiteria = $this->sumarSubtotalConfiteria($reserva);

        return [
            'codigo_reserva' => (string) $reserva->codigo_reserva,
            'token_qr' => $tokenEfectivo,
            'pelicula' => (string) ($reserva->pelicula?->titulo ?? ''),
            'imagen_url' => $reserva->pelicula?->imagen_url,
            'sala' => (string) ($reserva->sala?->nombre ?? ''),
            'fecha' => $this->formatoFechaReservaYmd($reserva),
            'hora_inicio' => $this->formatoHoraCorta((string) $reserva->hora_inicio),
            'hora_fin' => $this->formatoHoraCorta((string) $reserva->hora_fin),
            'asientos' => (int) $reserva->cantidad_personas,
            'confiteria' => $this->serializarProductosConfiteria($reserva),
            'subtotal_confiteria' => round($subtotalConfiteria, 2),
            'total' => round((float) $pago->monto, 2),
            'estado' => $this->estadoTicketTexto($reserva),
            'qr_imagen' => $this->generarQrImagenDataUri($tokenEfectivo),
        ];
    }

    private function estadoTicketTexto(Reserva $reserva): string
    {
        if ($reserva->ticket_usado || $reserva->fecha_uso_acceso !== null || $reserva->estado === 'utilizada') {
            return 'utilizado';
        }

        if ($this->funcionYaFinalizo($reserva)) {
            return 'expirado';
        }

        return 'vigente';
    }

    private function sumarSubtotalConfiteria(Reserva $reserva): float
    {
        $total = 0.0;
        foreach ($reserva->reservaProductos as $linea) {
            $total += (float) $linea->subtotal;
        }

        return $total;
    }

    /**
     * @return list<array{nombre: string, cantidad: int, subtotal: float}>
     */
    private function serializarProductosConfiteria(Reserva $reserva): array
    {
        return $reserva->reservaProductos->map(function (ReservaProducto $rp): array {
            return [
                'nombre' => (string) ($rp->producto?->nombre ?? 'Producto'),
                'cantidad' => (int) $rp->cantidad,
                'subtotal' => round((float) $rp->subtotal, 2),
            ];
        })->values()->all();
    }

    private function formatoHoraCorta(string $hora): string
    {
        $hora = trim($hora);

        return strlen($hora) >= 5 ? substr($hora, 0, 5) : $hora;
    }

    /**
     * @param  array<string, mixed>|null  $datos
     * @return array{exito: bool, mensaje: string, datos: array<string, mixed>|null, codigo_http: int}
     */
    private function respuestaValidacion(bool $exito, string $mensaje, ?array $datos, int $codigoHttp): array
    {
        return [
            'exito' => $exito,
            'mensaje' => $mensaje,
            'datos' => $datos,
            'codigo_http' => $codigoHttp,
        ];
    }

    /**
     * @param  array{
     *     tipo: string,
     *     reserva?: Reserva,
     *     pago?: Pago|null
     * }  $evaluacion
     * @return array{exito: bool, mensaje: string, datos: array<string, mixed>|null, codigo_http: int}|null
     */
    private function respuestaValidacionEmpleadoPorEvaluacion(array $evaluacion): ?array
    {
        return match ($evaluacion['tipo']) {
            'invalido', 'no_pagado' => $this->respuestaValidacion(false, 'Ticket inválido', null, 422),
            'expirado' => $this->respuestaValidacion(false, 'La función ya finalizó', null, 422),
            'usado' => $this->respuestaValidacion(false, 'Ticket ya utilizado', null, 422),
            'valido' => isset($evaluacion['reserva'])
                ? null
                : $this->respuestaValidacion(false, 'Ticket inválido', null, 422),
            default => $this->respuestaValidacion(false, 'Ticket inválido', null, 422),
        };
    }

    /**
     * @param  array{
     *     tipo: string,
     *     reserva?: Reserva,
     *     pago?: Pago|null
     * }  $evaluacion
     * @return array{ok: bool, mensaje: string}|null
     */
    private function respuestaLegacyPorEvaluacion(array $evaluacion): ?array
    {
        return match ($evaluacion['tipo']) {
            'no_pagado' => ['ok' => false, 'mensaje' => 'La reserva no está pagada.'],
            'invalido' => ['ok' => false, 'mensaje' => 'QR inválido.'],
            'expirado' => ['ok' => false, 'mensaje' => 'La función ya finalizó'],
            'usado' => ['ok' => false, 'mensaje' => 'Este ticket ya fue utilizado.'],
            'valido' => isset($evaluacion['reserva'])
                ? null
                : ['ok' => false, 'mensaje' => 'QR inválido.'],
            default => ['ok' => false, 'mensaje' => 'QR inválido.'],
        };
    }

    /**
     * Empleado: rechaza también si `ticket_usado` está marcado antes de registrar ingreso.
     * Legacy: no considera solo `ticket_usado` (misma rama que el flujo histórico).
     */
    private function registrarIngresoEnTransaccion(Reserva $reserva, bool $rechazarSiTicketMarcadoUsado): void
    {
        $this->ticketRepository->transaccion(function () use ($reserva, $rechazarSiTicketMarcadoUsado): void {
            $bloqueada = $this->ticketRepository->bloquearReservaPorId((int) $reserva->id);

            if ($bloqueada === null) {
                throw new TicketYaUsadoException;
            }

            if ($rechazarSiTicketMarcadoUsado && $bloqueada->ticket_usado) {
                throw new TicketYaUsadoException;
            }

            if ($bloqueada->fecha_uso_acceso !== null || $bloqueada->estado === 'utilizada') {
                throw new TicketYaUsadoException;
            }

            if ($this->funcionYaFinalizo($bloqueada)) {
                throw new TicketYaUsadoException;
            }

            $this->ticketRepository->registrarIngreso($bloqueada);
        });
    }

    private function formatoFechaReservaYmd(Reserva $reserva): string
    {
        return $reserva->fecha instanceof Carbon
            ? $reserva->fecha->format('Y-m-d')
            : Carbon::parse((string) $reserva->fecha)->format('Y-m-d');
    }

    private function generarContenidoQr(string $formato, string $url): string
    {
        /** @var string $contenido */
        $contenido = QrCode::format($formato)
            ->size(320)
            ->margin(2)
            ->errorCorrection('H')
            ->generate($url);

        return $contenido;
    }
}

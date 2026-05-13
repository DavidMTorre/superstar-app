<?php

namespace App\Services;

use App\Models\Pago;
use App\Models\Reserva;
use App\Models\ReservaProducto;
use App\Models\User;
use App\Repositories\ReservaRepository;
use App\Repositories\UserRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class PerfilService
{
    public function __construct(
        private readonly ReservaRepository $reservaRepository,
        private readonly UserRepository $userRepository
    ) {}

    /**
     * @return array{id: int, nombre: string, correo: string, fecha_registro: string}
     */
    public function serializarPerfil(User $usuario): array
    {
        return [
            'id' => (int) $usuario->id,
            'nombre' => (string) $usuario->name,
            'correo' => (string) $usuario->email,
            'fecha_registro' => $usuario->created_at !== null
                ? $usuario->created_at->format('Y-m-d')
                : '',
        ];
    }

    /**
     * @param  array{password_actual: string, password_nueva: string, password_nueva_confirmation: string}  $datos
     * @return array{ok: true}|array{ok: false, mensaje: string}
     */
    public function cambiarPassword(User $usuario, array $datos): array
    {
        if (! Hash::check($datos['password_actual'], $usuario->password)) {
            return [
                'ok' => false,
                'mensaje' => 'La contraseña actual es incorrecta',
            ];
        }

        $this->userRepository->actualizar($usuario, [
            'password' => $datos['password_nueva'],
        ]);

        return ['ok' => true];
    }

    /**
     * @return array{proximas: list<array<string, mixed>>, historial: list<array<string, mixed>>}
     */
    public function historialReservas(User $usuario): array
    {
        $coleccion = $this->reservaRepository->listarPorUsuario((int) $usuario->id);

        $hoy = Carbon::now()->startOfDay();

        /** @var \Illuminate\Support\Collection<int, Reserva> $proximas */
        $proximas = collect();
        /** @var \Illuminate\Support\Collection<int, Reserva> $historial */
        $historial = collect();

        foreach ($coleccion as $reserva) {
            $fechaReserva = $reserva->fecha instanceof Carbon
                ? $reserva->fecha->copy()->startOfDay()
                : Carbon::parse((string) $reserva->fecha)->startOfDay();

            if ($fechaReserva->greaterThanOrEqualTo($hoy)) {
                $proximas->push($reserva);
            } else {
                $historial->push($reserva);
            }
        }

        $proximasOrdenadas = $proximas->sortBy(function (Reserva $r): string {
            return $this->claveOrdenFechaHora($r);
        })->values();

        $historialOrdenado = $historial->sortByDesc(function (Reserva $r): string {
            return $this->claveOrdenFechaHora($r);
        })->values();

        return [
            'proximas' => $proximasOrdenadas->map(fn (Reserva $r) => $this->serializarReservaPerfil($r))->all(),
            'historial' => $historialOrdenado->map(fn (Reserva $r) => $this->serializarReservaPerfil($r))->all(),
        ];
    }

    private function claveOrdenFechaHora(Reserva $reserva): string
    {
        $fecha = $reserva->fecha instanceof Carbon
            ? $reserva->fecha->format('Y-m-d')
            : Carbon::parse((string) $reserva->fecha)->format('Y-m-d');
        $hora = (string) $reserva->hora_inicio;

        return $fecha.' '.$hora;
    }

    /**
     * @return array<string, mixed>
     */
    private function serializarReservaPerfil(Reserva $reserva): array
    {
        $pago = $reserva->pago;
        $subtotalConfiteria = $this->sumarSubtotalConfiteria($reserva);

        return [
            'codigo_reserva' => (string) $reserva->codigo_reserva,
            'pelicula' => (string) ($reserva->pelicula?->titulo ?? ''),
            'imagen_url' => $reserva->pelicula?->imagen_url,
            'sala' => (string) ($reserva->sala?->nombre ?? ''),
            'fecha' => $reserva->fecha instanceof Carbon
                ? $reserva->fecha->format('Y-m-d')
                : Carbon::parse((string) $reserva->fecha)->format('Y-m-d'),
            'hora_inicio' => $this->formatoHoraCorta((string) $reserva->hora_inicio),
            'hora_fin' => $this->formatoHoraCorta((string) $reserva->hora_fin),
            'cantidad_personas' => (int) $reserva->cantidad_personas,
            'subtotal_confiteria' => round($subtotalConfiteria, 2),
            'total_pagado' => $pago !== null ? round((float) $pago->monto, 2) : 0.0,
            'estado_pago' => $pago !== null ? (string) $pago->estado : 'pendiente',
            'qr_url' => $this->construirQrUrl($reserva, $pago),
            'token_qr' => $reserva->token_qr !== null && $reserva->token_qr !== ''
                ? (string) $reserva->token_qr
                : (($pago !== null && $pago->codigo_ticket_qr !== null && $pago->codigo_ticket_qr !== '')
                    ? (string) $pago->codigo_ticket_qr
                    : null),
            'codigo_qr' => $pago !== null && $pago->codigo_ticket_qr !== null && $pago->codigo_ticket_qr !== ''
                ? (string) $pago->codigo_ticket_qr
                : null,
            'productos_confiteria' => $this->serializarProductosConfiteria($reserva),
        ];
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

    private function construirQrUrl(Reserva $reserva, ?Pago $pago): ?string
    {
        $token = $reserva->token_qr
            ?? ($pago !== null ? $pago->codigo_ticket_qr : null);

        if ($token === null || $token === '') {
            return null;
        }

        $base = rtrim((string) config('app.frontend_url', ''), '/');
        if ($base === '') {
            return null;
        }

        return $base.'/ticket/'.rawurlencode((string) $token);
    }
}

<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Pelicula;
use App\Models\Reserva;
use App\Models\Sala;
use App\Repositories\PeliculaRepository;
use App\Repositories\ReservaRepository;
use App\Repositories\SalaHorarioRepository;
use App\Repositories\SalaRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReservaService
{
    public function __construct(
        private readonly PeliculaRepository $peliculaRepository,
        private readonly SalaRepository $salaRepository,
        private readonly SalaHorarioRepository $salaHorarioRepository,
        private readonly ReservaRepository $reservaRepository
    ) {}

    /**
     * @param  array{
     *     pelicula_id: int,
     *     sala_id: int,
     *     fecha: string,
     *     hora_inicio: string,
     *     cantidad_personas: int,
     *     usuario_id?: int|null,
     *     guest_id?: string|null
     * }  $datos
     * @return array{ok: true, reserva: array<string, mixed>}|array{ok: false, mensaje: string}
     */
    public function crearReserva(array $datos): array
    {
        return DB::transaction(function () use ($datos): array {
            $peliculaId = (int) $datos['pelicula_id'];
            $salaId = (int) $datos['sala_id'];
            $fechaYmd = $datos['fecha'];

            if (! $this->peliculaRepository->estaDisponible($peliculaId)) {
                return [
                    'ok' => false,
                    'mensaje' => 'La película no está disponible para reservas.',
                ];
            }

            $pelicula = $this->peliculaRepository->buscarPorId($peliculaId);
            if ($pelicula === null) {
                return [
                    'ok' => false,
                    'mensaje' => 'La película no existe.',
                ];
            }

            $sala = $this->salaRepository->buscarPorIdBloqueado($salaId);
            if ($sala === null) {
                return [
                    'ok' => false,
                    'mensaje' => 'La sala no existe.',
                ];
            }

            if ($sala->estado === 'inactiva') {
                return [
                    'ok' => false,
                    'mensaje' => 'La sala no está disponible.',
                ];
            }

            $precioSala = $sala->precio;
            if ($precioSala === null) {
                return [
                    'ok' => false,
                    'mensaje' => 'No se pudo determinar el precio de la sala.',
                ];
            }

            $horaInicio = Carbon::parse($fechaYmd.' '.trim($datos['hora_inicio']));
            $totalMinutos = (int) $pelicula->duracion + (int) $sala->tiempo_limpieza;
            $horaFin = (clone $horaInicio)->addMinutes($totalMinutos);

            if (! $horaFin->isSameDay($horaInicio)) {
                return [
                    'ok' => false,
                    'mensaje' => 'La función supera medianoche; elige otra hora de inicio.',
                ];
            }

            $this->validarHorarioAtencion($sala->id, $fechaYmd, $horaInicio, $horaFin);

            $horaInicioStr = $horaInicio->format('H:i:s');
            $horaFinStr = $horaFin->format('H:i:s');

            if ($this->reservaRepository->existeSolapamiento($sala->id, $fechaYmd, $horaInicioStr, $horaFinStr)) {
                return [
                    'ok' => false,
                    'mensaje' => 'Horario no disponible para esta sala',
                ];
            }

            $userId = isset($datos['usuario_id']) ? (int) $datos['usuario_id'] : null;
            $guestId = isset($datos['guest_id']) ? (string) $datos['guest_id'] : null;

            $precioStr = number_format((float) $precioSala, 2, '.', '');

            $reserva = $this->reservaRepository->create([
                'codigo_reserva' => (string) Str::uuid(),
                'user_id' => $userId,
                'guest_id' => $guestId,
                'pelicula_id' => $pelicula->id,
                'sala_id' => $sala->id,
                'fecha' => $fechaYmd,
                'hora_inicio' => $horaInicioStr,
                'hora_fin' => $horaFinStr,
                'cantidad_personas' => (int) $datos['cantidad_personas'],
                'precio_total' => $precioStr,
                'estado' => 'reservado',
                'metadata' => [
                    'pago_estado' => 'pendiente',
                ],
            ]);

            $reserva->load(['sala', 'pelicula']);

            return [
                'ok' => true,
                'reserva' => $this->reservaPublica($reserva, $pelicula, $sala),
            ];
        });
    }

    /**
     * @throws BusinessException
     */
    private function validarHorarioAtencion(int $salaId, string $fechaYmd, Carbon $horaInicio, Carbon $horaFin): void
    {
        $diaSemana = (int) Carbon::parse($fechaYmd)->format('w');
        $registro = $this->salaHorarioRepository->obtenerPorSalaYDia($salaId, $diaSemana);

        if ($registro === null) {
            throw new BusinessException('La sala no atiende este día');
        }

        $apertura = $this->carbonEnFecha($fechaYmd, $registro->hora_apertura);
        $cierre = $this->carbonEnFecha($fechaYmd, $registro->hora_cierre);

        if ($horaInicio->lt($apertura)) {
            throw new BusinessException('La hora es antes de apertura');
        }

        if ($horaFin->gt($cierre)) {
            throw new BusinessException('La reserva excede el horario de atención');
        }
    }

    private function carbonEnFecha(string $fechaYmd, mixed $hora): Carbon
    {
        $h = is_string($hora) ? trim($hora) : (string) $hora;
        $partes = explode(':', $h);
        if (count($partes) === 2) {
            $h .= ':00';
        }

        return Carbon::parse($fechaYmd.' '.$h);
    }

    /**
     * @return array<string, mixed>
     */
    private function reservaPublica(Reserva $reserva, ?Pelicula $pelicula, Sala $sala): array
    {
        $horaInicioStr = is_string($reserva->hora_inicio)
            ? $reserva->hora_inicio
            : (string) $reserva->hora_inicio;
        $horaFinStr = is_string($reserva->hora_fin)
            ? $reserva->hora_fin
            : (string) $reserva->hora_fin;

        $horaFuncion = strlen($horaInicioStr) >= 5
            ? substr($horaInicioStr, 0, 5)
            : $horaInicioStr;
        $horaFinCorta = strlen($horaFinStr) >= 5
            ? substr($horaFinStr, 0, 5)
            : $horaFinStr;

        $fechaStr = $reserva->fecha?->format('Y-m-d') ?? '';

        return [
            'id' => (int) $reserva->id,
            'codigo_reserva' => $reserva->codigo_reserva,
            'usuario_id' => $reserva->user_id,
            'guest_id' => $reserva->guest_id,
            'pelicula_id' => (int) $reserva->pelicula_id,
            'pelicula_titulo' => $pelicula?->titulo ?? '',
            'pelicula' => $pelicula === null ? null : [
                'id' => (int) $pelicula->id,
                'titulo' => $pelicula->titulo,
            ],
            'sala' => (string) ($sala->nombre ?? ''),
            'sala_id' => (int) $reserva->sala_id,
            'sala_precio' => (float) $sala->precio,
            'fecha' => $fechaStr,
            'fecha_funcion' => $fechaStr,
            'hora_inicio' => $horaInicioStr,
            'hora_fin' => $horaFinStr,
            'hora_funcion' => $horaFuncion,
            'hora_fin_display' => $horaFinCorta,
            'cantidad_personas' => (int) $reserva->cantidad_personas,
            'precio_total' => (float) $reserva->precio_total,
            'estado' => $reserva->estado,
            'metadata' => $reserva->metadata ?? ['pago_estado' => 'pendiente'],
        ];
    }
}

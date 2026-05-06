<?php

namespace App\Services;

use App\Models\Reserva;
use App\Models\Sala;
use App\Models\SalaHorario;
use App\Repositories\PeliculaRepository;
use App\Repositories\ReservaRepository;
use App\Repositories\SalaRepository;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class DisponibilidadService
{
    private const INTERVALO_MINUTOS = 15;

    public function __construct(
        private readonly PeliculaRepository $peliculaRepository,
        private readonly SalaRepository $salaRepository,
        private readonly ReservaRepository $reservaRepository
    ) {}

    /**
     * @return array{
     *     ok: true,
     *     datos: list<array{sala_id: int, sala: string, hora_inicio: string, hora_fin: string, precio: float}>
     * }|array{ok: false, mensaje: string}
     */
    public function obtenerDisponibilidad(int $peliculaId, string $fechaYmd): array
    {
        $pelicula = $this->peliculaRepository->buscarPorId($peliculaId);
        if ($pelicula === null) {
            return ['ok' => false, 'mensaje' => 'La película no existe.'];
        }

        if ($pelicula->estado !== 'disponible') {
            return ['ok' => false, 'mensaje' => 'La película no está disponible para reservas.'];
        }

        $diaSemana = (int) Carbon::parse($fechaYmd)->format('w');
        $salas = $this->salaRepository->disponiblesConHorarioActivoEnDia($diaSemana);
        if ($salas->isEmpty()) {
            return ['ok' => true, 'datos' => []];
        }

        /** @var list<int> $salaIds */
        $salaIds = $salas->pluck('id')->map(fn ($id) => (int) $id)->all();
        $reservasPorSala = $this->reservaRepository->obtenerReservasPorSalasYFecha($salaIds, $fechaYmd);

        $duracionPelicula = (int) $pelicula->duracion;
        /** @var list<array{sala_id: int, sala: string, hora_inicio: string, hora_fin: string, precio: float}> $filas */
        $filas = [];

        foreach ($salas as $sala) {
            /** @var SalaHorario|null $horarioDia */
            $horarioDia = $sala->horarios->first();
            if ($horarioDia === null) {
                continue;
            }

            $duracionTotal = $duracionPelicula + (int) $sala->tiempo_limpieza;
            /** @var Collection<int, Reserva> $reservasSala */
            $reservasSala = $reservasPorSala->get($sala->id, collect());
            $apertura = $this->momentoEnFecha($fechaYmd, $horarioDia->hora_apertura);
            $cierre = $this->momentoEnFecha($fechaYmd, $horarioDia->hora_cierre);
            $slots = $this->generarSlotsParaSala($fechaYmd, $duracionTotal, $reservasSala, $apertura, $cierre);
            foreach ($slots as $slot) {
                $filas[] = [
                    'sala_id' => (int) $sala->id,
                    'sala' => (string) $sala->nombre,
                    'hora_inicio' => $slot['inicio'],
                    'hora_fin' => $slot['fin'],
                    'precio' => (float) $sala->precio,
                ];
            }
        }

        usort($filas, function (array $a, array $b): int {
            $cmp = strcmp($a['hora_inicio'], $b['hora_inicio']);
            if ($cmp !== 0) {
                return $cmp;
            }

            return $a['sala_id'] <=> $b['sala_id'];
        });

        return ['ok' => true, 'datos' => $filas];
    }

    /**
     * @param  Collection<int, Reserva>  $reservas
     * @return list<array{inicio: string, fin: string}>
     */
    private function generarSlotsParaSala(
        string $fechaYmd,
        int $duracionTotalMinutos,
        Collection $reservas,
        Carbon $apertura,
        Carbon $cierre
    ): array {
        if ($cierre->lte($apertura)) {
            return [];
        }

        $ocupadosMerged = $this->intervalosOcupadosMerged($fechaYmd, $apertura, $cierre, $reservas);
        $huecos = $this->huecosLibres($apertura, $cierre, $ocupadosMerged);

        /** @var list<array{inicio: string, fin: string}> $resultado */
        $resultado = [];

        foreach ($huecos as [$ini, $fin]) {
            $cursor = $ini->copy();
            while ($cursor->lt($fin)) {
                $finSlot = $cursor->copy()->addMinutes($duracionTotalMinutos);
                if ($finSlot->gt($fin)) {
                    break;
                }
                if (! $finSlot->isSameDay($cursor)) {
                    break;
                }
                if ($finSlot->gt($cierre)) {
                    break;
                }

                $resultado[] = [
                    'inicio' => $cursor->format('H:i'),
                    'fin' => $finSlot->format('H:i'),
                ];
                $cursor->addMinutes(self::INTERVALO_MINUTOS);
            }
        }

        return $resultado;
    }

    /**
     * @param  Collection<int, Reserva>  $reservas
     * @return list<array{0: Carbon, 1: Carbon}>
     */
    private function intervalosOcupadosMerged(string $fechaYmd, Carbon $apertura, Carbon $cierre, Collection $reservas): array
    {
        /** @var list<array{0: Carbon, 1: Carbon}> $raw */
        $raw = [];
        foreach ($reservas as $r) {
            $a = $this->momentoEnFecha($fechaYmd, $r->hora_inicio)->max($apertura);
            $b = $this->momentoEnFecha($fechaYmd, $r->hora_fin)->min($cierre);
            if ($b->lte($a)) {
                continue;
            }
            $raw[] = [$a, $b];
        }

        return $this->fusionarIntervalos($raw);
    }

    /**
     * @param  list<array{0: Carbon, 1: Carbon}>  $mergedOcupados
     * @return list<array{0: Carbon, 1: Carbon}>
     */
    private function huecosLibres(Carbon $apertura, Carbon $cierre, array $mergedOcupados): array
    {
        if ($mergedOcupados === []) {
            return [[$apertura->copy(), $cierre->copy()]];
        }

        /** @var list<array{0: Carbon, 1: Carbon}> $huecos */
        $huecos = [];
        $cursor = $apertura->copy();

        foreach ($mergedOcupados as [$oIni, $oFin]) {
            if ($cursor->lt($oIni)) {
                $huecos[] = [$cursor->copy(), $oIni->copy()];
            }
            if ($oFin->gt($cursor)) {
                $cursor = $oFin->copy();
            }
        }

        if ($cursor->lt($cierre)) {
            $huecos[] = [$cursor->copy(), $cierre->copy()];
        }

        return $huecos;
    }

    /**
     * @param  list<array{0: Carbon, 1: Carbon}>  $intervalos
     * @return list<array{0: Carbon, 1: Carbon}>
     */
    private function fusionarIntervalos(array $intervalos): array
    {
        if ($intervalos === []) {
            return [];
        }

        usort($intervalos, fn (array $x, array $y): int => $x[0]->timestamp <=> $y[0]->timestamp);

        /** @var Carbon $cs */
        /** @var Carbon $ce */
        [$cs, $ce] = $intervalos[0];
        $merged = [];

        for ($i = 1, $n = count($intervalos); $i < $n; $i++) {
            [$s, $e] = $intervalos[$i];
            if ($s->lte($ce)) {
                $ce = $ce->max($e);
            } else {
                $merged[] = [$cs, $ce];
                $cs = $s;
                $ce = $e;
            }
        }

        $merged[] = [$cs, $ce];

        return $merged;
    }

    private function momentoEnFecha(string $fechaYmd, mixed $hora): Carbon
    {
        $h = is_string($hora) ? trim($hora) : (string) $hora;
        if (substr_count($h, ':') === 1) {
            $h .= ':00';
        }

        return Carbon::parse($fechaYmd.' '.$h);
    }
}

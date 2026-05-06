<?php

namespace App\Services;

use App\Models\SalaHorario;
use App\Repositories\SalaHorarioRepository;
use App\Repositories\SalaRepository;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AdminSalaHorarioService
{
    public function __construct(
        private readonly SalaRepository $salaRepository,
        private readonly SalaHorarioRepository $salaHorarioRepository
    ) {}

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function listar(int $salaId): ?Collection
    {
        if ($this->salaRepository->buscarPorId($salaId) === null) {
            return null;
        }

        return SalaHorario::query()
            ->where('sala_id', $salaId)
            ->orderBy('dia_semana')
            ->get()
            ->map(fn (SalaHorario $h) => $this->serializar($h));
    }

    /**
     * @param  array{hora_apertura: string, hora_cierre: string, dia_semana: int, activo?: bool}  $datos
     * @return array{ok: true, horario: array<string, mixed>}|array{ok: false, mensaje: string}
     */
    public function crear(int $salaId, array $datos): array
    {
        $sala = $this->salaRepository->buscarPorId($salaId);
        if ($sala === null) {
            return ['ok' => false, 'mensaje' => 'Sala no encontrada.'];
        }

        $validacion = $this->validarVentana($datos['hora_apertura'], $datos['hora_cierre']);
        if ($validacion !== null) {
            return ['ok' => false, 'mensaje' => $validacion];
        }

        if ($this->salaHorarioRepository->existeRegistroParaSalaYDia($salaId, (int) $datos['dia_semana'])) {
            return ['ok' => false, 'mensaje' => 'Ya existe un horario para ese día en esta sala.'];
        }

        $attrs = [
            'sala_id' => $salaId,
            'dia_semana' => (int) $datos['dia_semana'],
            'hora_apertura' => $this->normalizarHoraGuardado($datos['hora_apertura']),
            'hora_cierre' => $this->normalizarHoraGuardado($datos['hora_cierre']),
            'activo' => array_key_exists('activo', $datos) ? (bool) $datos['activo'] : true,
        ];

        $horario = $this->salaHorarioRepository->crear($attrs);

        return ['ok' => true, 'horario' => $this->serializar($horario)];
    }

    /**
     * @param  array{hora_apertura?: string, hora_cierre?: string, activo?: bool}  $datos
     * @return array{ok: true, horario: array<string, mixed>}|array{ok: false, mensaje: string}
     */
    public function actualizar(int $salaId, int $horarioId, array $datos): array
    {
        $horario = $this->salaHorarioRepository->buscarPorIdEnSala($salaId, $horarioId);
        if ($horario === null) {
            return ['ok' => false, 'mensaje' => 'Horario no encontrado.'];
        }

        $tieneHoras = array_key_exists('hora_apertura', $datos) && array_key_exists('hora_cierre', $datos);
        if ($tieneHoras) {
            $validacion = $this->validarVentana($datos['hora_apertura'], $datos['hora_cierre']);
            if ($validacion !== null) {
                return ['ok' => false, 'mensaje' => $validacion];
            }
        }

        /** @var array<string, mixed> $attrs */
        $attrs = [];
        if ($tieneHoras) {
            $attrs['hora_apertura'] = $this->normalizarHoraGuardado($datos['hora_apertura']);
            $attrs['hora_cierre'] = $this->normalizarHoraGuardado($datos['hora_cierre']);
        }
        if (array_key_exists('activo', $datos)) {
            $attrs['activo'] = (bool) $datos['activo'];
        }

        if ($attrs === []) {
            return ['ok' => false, 'mensaje' => 'No hay datos para actualizar.'];
        }

        $this->salaHorarioRepository->actualizar($horario, $attrs);

        return ['ok' => true, 'horario' => $this->serializar($horario->fresh())];
    }

    /**
     * @return array{ok: true}|array{ok: false, mensaje: string}
     */
    public function eliminar(int $salaId, int $horarioId): array
    {
        $horario = $this->salaHorarioRepository->buscarPorIdEnSala($salaId, $horarioId);
        if ($horario === null) {
            return ['ok' => false, 'mensaje' => 'Horario no encontrado.'];
        }

        $this->salaHorarioRepository->eliminar($horario);

        return ['ok' => true];
    }

    private function validarVentana(string $apertura, string $cierre): ?string
    {
        $a = Carbon::parse('2000-01-01 '.$this->normalizarHoraGuardado($apertura));
        $c = Carbon::parse('2000-01-01 '.$this->normalizarHoraGuardado($cierre));
        if ($a->greaterThanOrEqualTo($c)) {
            return 'La hora de apertura debe ser anterior al cierre.';
        }

        return null;
    }

    private function normalizarHoraGuardado(string $hora): string
    {
        $hora = trim($hora);
        $parsed = Carbon::parse('2000-01-01 '.$hora);

        return $parsed->format('H:i:s');
    }

    /**
     * @return array<string, mixed>
     */
    private function serializar(SalaHorario $h): array
    {
        return [
            'id' => (int) $h->id,
            'sala_id' => (int) $h->sala_id,
            'dia_semana' => (int) $h->dia_semana,
            'hora_apertura' => $this->formatearHoraRespuesta($h->hora_apertura),
            'hora_cierre' => $this->formatearHoraRespuesta($h->hora_cierre),
            'activo' => (bool) $h->activo,
        ];
    }

    private function formatearHoraRespuesta(mixed $valor): string
    {
        if ($valor === null) {
            return '00:00';
        }
        $s = is_string($valor) ? $valor : (string) $valor;

        return strlen($s) >= 5 ? substr($s, 0, 5) : $s;
    }
}

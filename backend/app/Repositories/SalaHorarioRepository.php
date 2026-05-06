<?php

namespace App\Repositories;

use App\Models\SalaHorario;

class SalaHorarioRepository
{
    public function obtenerPorSalaYDia(int $salaId, int $diaSemana): ?SalaHorario
    {
        return SalaHorario::query()
            ->where('sala_id', $salaId)
            ->where('dia_semana', $diaSemana)
            ->where('activo', true)
            ->first();
    }

    public function existeRegistroParaSalaYDia(int $salaId, int $diaSemana): bool
    {
        return SalaHorario::query()
            ->where('sala_id', $salaId)
            ->where('dia_semana', $diaSemana)
            ->exists();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function crear(array $attributes): SalaHorario
    {
        return SalaHorario::query()->create($attributes);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function actualizar(SalaHorario $horario, array $attributes): void
    {
        $horario->fill($attributes);
        $horario->save();
    }

    public function eliminar(SalaHorario $horario): void
    {
        $horario->delete();
    }

    public function buscarPorIdEnSala(int $salaId, int $horarioId): ?SalaHorario
    {
        return SalaHorario::query()
            ->where('sala_id', $salaId)
            ->whereKey($horarioId)
            ->first();
    }
}

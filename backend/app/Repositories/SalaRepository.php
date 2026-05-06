<?php

namespace App\Repositories;

use App\Models\Sala;
use Illuminate\Support\Collection;

class SalaRepository
{
    /**
     * @return Collection<int, Sala>
     */
    public function todasOrdenadasPorId(): Collection
    {
        return Sala::query()->orderBy('id')->get();
    }

    /**
     * @return Collection<int, Sala>
     */
    public function disponiblesOrdenadasPorId(): Collection
    {
        return Sala::query()
            ->where('estado', 'disponible')
            ->with('horarios')
            ->orderBy('id')
            ->get();
    }

    /**
     * Salas disponibles con horario activo para un día de la semana (0=domingo … 6=sábado).
     * Incluye la relación `horarios` filtrada a ese día (como mucho un registro por sala).
     *
     * @return Collection<int, Sala>
     */
    public function disponiblesConHorarioActivoEnDia(int $diaSemana): Collection
    {
        return Sala::query()
            ->where('estado', 'disponible')
            ->whereHas('horarios', function ($q) use ($diaSemana) {
                $q->where('dia_semana', $diaSemana)
                    ->where('activo', true);
            })
            ->with([
                'horarios' => fn ($q) => $q->where('dia_semana', $diaSemana)->where('activo', true),
            ])
            ->orderBy('id')
            ->get();
    }

    public function buscarPorId(int $id): ?Sala
    {
        return Sala::query()->find($id);
    }

    public function buscarPorIdBloqueado(int $id): ?Sala
    {
        return Sala::query()->whereKey($id)->lockForUpdate()->first();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function crear(array $attributes): Sala
    {
        return Sala::query()->create($attributes);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function actualizar(Sala $sala, array $attributes): void
    {
        $sala->fill($attributes);
        $sala->save();
    }
}

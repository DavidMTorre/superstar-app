<?php

namespace App\Repositories;

use App\Models\Combo;
use Illuminate\Support\Collection;

class ComboRepository
{
    /**
     * @return Collection<int, Combo>
     */
    public function obtenerDisponibles(): Collection
    {
        return Combo::query()
            ->where('estado', 'disponible')
            ->with('productos')
            ->orderBy('nombre')
            ->get();
    }

    /**
     * @return Collection<int, Combo>
     */
    public function obtenerTodos(): Collection
    {
        return Combo::query()
            ->with(['productos' => fn ($q) => $q->orderBy('productos_confiteria.nombre')])
            ->orderBy('nombre')
            ->get();
    }

    public function buscarPorId(int $id): ?Combo
    {
        return Combo::query()->find($id);
    }

    public function buscarPorIdConProductos(int $id): ?Combo
    {
        return Combo::query()
            ->with('productos')
            ->find($id);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function crear(array $attributes): Combo
    {
        return Combo::query()->create($attributes);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function actualizar(Combo $combo, array $attributes): void
    {
        $combo->fill($attributes);
        $combo->save();
    }

    public function eliminar(Combo $combo): void
    {
        $combo->delete();
    }
}

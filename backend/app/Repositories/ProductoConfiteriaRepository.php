<?php

namespace App\Repositories;

use App\Models\ProductoConfiteria;
use App\Models\ReservaProducto;
use Illuminate\Support\Collection;

class ProductoConfiteriaRepository
{
    /**
     * @return Collection<int, ProductoConfiteria>
     */
    public function obtenerDisponibles(): Collection
    {
        return ProductoConfiteria::query()
            ->where('estado', 'disponible')
            ->orderBy('nombre')
            ->get();
    }

    /**
     * Todos los productos (admin).
     *
     * @return Collection<int, ProductoConfiteria>
     */
    public function obtenerTodos(): Collection
    {
        return ProductoConfiteria::query()
            ->orderBy('nombre')
            ->get();
    }

    public function buscarPorId(int $id): ?ProductoConfiteria
    {
        return ProductoConfiteria::query()->find($id);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function crear(array $attributes): ProductoConfiteria
    {
        return ProductoConfiteria::query()->create($attributes);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function actualizar(ProductoConfiteria $producto, array $attributes): void
    {
        $producto->fill($attributes);
        $producto->save();
    }

    public function eliminar(ProductoConfiteria $producto): void
    {
        $producto->delete();
    }

    public function existeEnReservas(int $productoId): bool
    {
        return ReservaProducto::query()
            ->where('producto_id', $productoId)
            ->exists();
    }
}
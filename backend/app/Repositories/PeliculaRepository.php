<?php

namespace App\Repositories;

use App\Models\Pelicula;
use Illuminate\Support\Collection;

class PeliculaRepository
{
    public function estaDisponible(int $peliculaId): bool
    {
        return Pelicula::query()
            ->whereKey($peliculaId)
            ->where('estado', 'disponible')
            ->exists();
    }

    /**
     * Películas disponibles: hasta $limitePorCategoria por cada categoría (orden reciente por id).
     * Usa ventana SQL (ROW_NUMBER) para escalar sin cargar todo el catálogo en memoria.
     *
     * @return Collection<int, Pelicula>
     */
    public function destacadasPorCategoria(int $limitePorCategoria): Collection
    {
        $sub = Pelicula::query()
            ->select('peliculas.*')
            ->selectRaw('ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY peliculas.id DESC) as rn')
            ->where('estado', 'disponible');

        return Pelicula::query()
            ->fromSub($sub, 'peliculas_ranked')
            ->where('rn', '<=', $limitePorCategoria)
            ->orderBy('categoria')
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Solo disponibles: opcional LIKE por título (`buscar`) y/o categoría exacta.
     *
     * @param  array{buscar?: string, categoria?: string}  $filtros
     * @return Collection<int, Pelicula>
     */
    public function filtrarDisponibles(array $filtros, int $limiteResultados): Collection
    {
        $q = Pelicula::query()->where('estado', 'disponible');

        if (! empty($filtros['buscar'])) {
            $like = '%'.addcslashes((string) $filtros['buscar'], '%_\\').'%';
            $q->where('titulo', 'like', $like);
        }

        if (! empty($filtros['categoria'])) {
            $q->where('categoria', $filtros['categoria']);
        }

        return $q
            ->orderByDesc('created_at')
            ->limit($limiteResultados)
            ->get();
    }

    /**
     * @return Collection<int, Pelicula>
     */
    public function todasOrdenadasPorIdDesc(): Collection
    {
        return Pelicula::query()->orderByDesc('id')->get();
    }

    public function buscarPorId(int $id): ?Pelicula
    {
        return Pelicula::query()->find($id);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function crear(array $attributes): Pelicula
    {
        return Pelicula::query()->create($attributes);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function actualizar(Pelicula $pelicula, array $attributes): void
    {
        $pelicula->fill($attributes);
        $pelicula->save();
    }

    public function eliminar(Pelicula $pelicula): void
    {
        $pelicula->delete();
    }
}

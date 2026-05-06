<?php

namespace App\Services;

use App\Models\Pelicula;
use App\Repositories\PeliculaRepository;

class PeliculaService
{
    /** Top por categoría en cartelera destacada (optimización frente a catálogo completo). */
    public const DESTACADAS_POR_CATEGORIA = 10;

    /** Tope de filas en búsqueda para mantener latencia estable (~1500+ registros). */
    public const BUSQUEDA_MAX_RESULTADOS = 50;

    public function __construct(
        private readonly PeliculaRepository $peliculaRepository
    ) {}

    /**
     * @return array<string, array<int, array<string, mixed>>>
     */
    public function obtenerCarteleraDestacada(): array
    {
        $peliculas = $this->peliculaRepository->destacadasPorCategoria(self::DESTACADAS_POR_CATEGORIA);

        $agrupadas = [];
        foreach ($peliculas->groupBy('categoria') as $categoria => $items) {
            $agrupadas[$categoria] = $items->map(fn (Pelicula $p) => $this->peliculaPublica($p))->values()->all();
        }

        ksort($agrupadas);

        return [
            'por_categoria' => $agrupadas,
        ];
    }

    /**
     * Lista plana para filtros en `/peliculas?buscar=&categoria=` (serializada para API).
     *
     * @param  array{buscar?: string, categoria?: string}  $filtros
     * @return list<array<string, mixed>>
     */
    public function listarPeliculas(array $filtros): array
    {
        $coleccion = $this->peliculaRepository->filtrarDisponibles($filtros, self::BUSQUEDA_MAX_RESULTADOS);

        return $coleccion->map(fn (Pelicula $p) => $this->peliculaPublica($p))->values()->all();
    }

    /**
     * @param  array{query?: string, categoria?: string}  $filtros
     * @return array{peliculas: array<int, array<string, mixed>>, total: int}
     */
    public function buscar(array $filtros): array
    {
        /** @var array{buscar?: string, categoria?: string} $repoFiltros */
        $repoFiltros = [];
        if (! empty($filtros['query'])) {
            $repoFiltros['buscar'] = $filtros['query'];
        }
        if (! empty($filtros['categoria'])) {
            $repoFiltros['categoria'] = $filtros['categoria'];
        }

        $coleccion = $this->peliculaRepository->filtrarDisponibles($repoFiltros, self::BUSQUEDA_MAX_RESULTADOS);

        $lista = $coleccion->map(fn (Pelicula $p) => $this->peliculaPublica($p))->values()->all();

        return [
            'peliculas' => $lista,
            'total' => count($lista),
        ];
    }

    /**
     * Representación API sin datos sensibles; `metadata` opcional para futuras recomendaciones.
     *
     * @return array<string, mixed>
     */
    private function peliculaPublica(Pelicula $pelicula): array
    {
        return [
            'id' => (int) $pelicula->id,
            'titulo' => $pelicula->titulo,
            'descripcion' => $pelicula->descripcion,
            'categoria' => $pelicula->categoria,
            'duracion' => (int) $pelicula->duracion,
            'imagen_url' => $pelicula->imagen_url,
            'estado' => $pelicula->estado,
        ];
    }
}

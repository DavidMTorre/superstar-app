<?php

namespace App\Services;

use App\Models\Pelicula;
use App\Repositories\PeliculaRepository;
use App\Repositories\ReservaRepository;
use Illuminate\Support\Collection;

class AdminPeliculaService
{
    public function __construct(
        private readonly PeliculaRepository $peliculaRepository,
        private readonly ReservaRepository $reservaRepository
    ) {}

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function listar(): Collection
    {
        return $this->peliculaRepository->todasOrdenadasPorIdDesc()->map(fn (Pelicula $p) => $this->serializar($p));
    }

    /**
     * @param  array<string, mixed>  $datos
     */
    public function crear(array $datos): array
    {
        $pelicula = $this->peliculaRepository->crear($datos);

        return $this->serializar($pelicula);
    }

    /**
     * @param  array<string, mixed>  $datos
     */
    public function actualizar(int $id, array $datos): ?array
    {
        $pelicula = $this->peliculaRepository->buscarPorId($id);

        if ($pelicula === null) {
            return null;
        }

        $this->peliculaRepository->actualizar($pelicula, $datos);

        return $this->serializar($pelicula->fresh());
    }

    /**
     * @return array{ok: bool, codigo?: string}
     */
    public function eliminar(int $id): array
    {
        $pelicula = $this->peliculaRepository->buscarPorId($id);

        if ($pelicula === null) {
            return ['ok' => false, 'codigo' => 'no_encontrada'];
        }

        if ($this->reservaRepository->contarPorPelicula($id) > 0) {
            return ['ok' => false, 'codigo' => 'tiene_reservas'];
        }

        $this->peliculaRepository->eliminar($pelicula);

        return ['ok' => true];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializar(Pelicula $pelicula): array
    {
        return [
            'id' => $pelicula->id,
            'titulo' => $pelicula->titulo,
            'descripcion' => $pelicula->descripcion,
            'categoria' => $pelicula->categoria,
            'duracion' => $pelicula->duracion,
            'imagen_url' => $pelicula->imagen_url,
            'estado' => $pelicula->estado,
            'metadata' => $pelicula->metadata,
            'created_at' => $pelicula->created_at?->toIso8601String(),
            'updated_at' => $pelicula->updated_at?->toIso8601String(),
        ];
    }
}

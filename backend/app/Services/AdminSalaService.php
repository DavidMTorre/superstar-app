<?php

namespace App\Services;

use App\Models\Sala;
use App\Repositories\SalaRepository;
use Illuminate\Support\Collection;

class AdminSalaService
{
    public function __construct(
        private readonly SalaRepository $salaRepository
    ) {}

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function listar(): Collection
    {
        return $this->salaRepository->todasOrdenadasPorId()->map(fn (Sala $s) => $this->serializar($s));
    }

    /**
     * @param  array{nombre: string, estado?: string, precio: float|int|string, tiempo_limpieza: int}  $datos
     */
    public function crear(array $datos): array
    {
        $sala = $this->salaRepository->crear([
            'nombre' => $datos['nombre'],
            'estado' => $datos['estado'] ?? 'disponible',
            'precio' => number_format((float) $datos['precio'], 2, '.', ''),
            'tiempo_limpieza' => (int) $datos['tiempo_limpieza'],
        ]);

        return $this->serializar($sala);
    }

    /**
     * @param  array<string, mixed>  $datos
     */
    public function actualizar(int $id, array $datos): ?array
    {
        $sala = $this->salaRepository->buscarPorId($id);

        if ($sala === null) {
            return null;
        }

        $this->salaRepository->actualizar($sala, [
            'nombre' => $datos['nombre'],
            'estado' => $datos['estado'],
            'precio' => number_format((float) $datos['precio'], 2, '.', ''),
            'tiempo_limpieza' => (int) $datos['tiempo_limpieza'],
        ]);

        return $this->serializar($sala->fresh());
    }

    /**
     * @param  array{estado: string}  $datos
     */
    public function cambiarEstado(int $id, array $datos): ?array
    {
        $sala = $this->salaRepository->buscarPorId($id);

        if ($sala === null) {
            return null;
        }

        $this->salaRepository->actualizar($sala, ['estado' => $datos['estado']]);

        return $this->serializar($sala->fresh());
    }

    /**
     * @return array<string, mixed>
     */
    private function serializar(Sala $sala): array
    {
        return [
            'id' => $sala->id,
            'nombre' => $sala->nombre,
            'estado' => $sala->estado,
            'precio' => (float) $sala->precio,
            'tiempo_limpieza' => (int) $sala->tiempo_limpieza,
            'created_at' => $sala->created_at?->toIso8601String(),
            'updated_at' => $sala->updated_at?->toIso8601String(),
        ];
    }
}

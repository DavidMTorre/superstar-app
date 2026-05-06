<?php

namespace App\Services;

use App\Models\ProductoConfiteria;
use App\Repositories\ProductoConfiteriaRepository;
use Illuminate\Support\Collection;

class AdminProductoConfiteriaService
{
    public function __construct(
        private readonly ProductoConfiteriaRepository $productoConfiteriaRepository
    ) {}

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function listar(): Collection
    {
        return $this->productoConfiteriaRepository->obtenerTodos()
            ->map(fn (ProductoConfiteria $p) => $this->serializar($p));
    }

    /**
     * @param  array{
     *     nombre: string,
     *     precio: float|int|string,
     *     descripcion?: string|null,
     *     imagen_url?: string|null,
     *     estado?: string|null,
     *     metadata?: array<string, mixed>|null
     * }  $datos
     */
    public function crear(array $datos): array
    {
        $producto = $this->productoConfiteriaRepository->crear([
            'nombre' => $datos['nombre'],
            'descripcion' => $datos['descripcion'] ?? null,
            'precio' => number_format((float) $datos['precio'], 2, '.', ''),
            'imagen_url' => $datos['imagen_url'] ?? null,
            'estado' => $datos['estado'] ?? 'disponible',
            'metadata' => $datos['metadata'] ?? null,
        ]);

        return $this->serializar($producto);
    }

    /**
     * @param  array<string, mixed>  $datos
     */
    public function actualizar(int $id, array $datos): ?array
    {
        $producto = $this->productoConfiteriaRepository->buscarPorId($id);
        if ($producto === null) {
            return null;
        }

        $attrs = [
            'nombre' => $datos['nombre'],
            'precio' => number_format((float) $datos['precio'], 2, '.', ''),
        ];

        if (array_key_exists('descripcion', $datos)) {
            $attrs['descripcion'] = $datos['descripcion'];
        }
        if (array_key_exists('imagen_url', $datos)) {
            $attrs['imagen_url'] = $datos['imagen_url'];
        }
        if (array_key_exists('estado', $datos) && $datos['estado'] !== null) {
            $attrs['estado'] = $datos['estado'];
        }
        if (array_key_exists('metadata', $datos)) {
            $attrs['metadata'] = $datos['metadata'];
        }

        $this->productoConfiteriaRepository->actualizar($producto, $attrs);

        return $this->serializar($producto->fresh());
    }

    /**
     * @return array{ok: true}|array{ok: false, mensaje: string, codigo_http: int}
     */
    public function eliminar(int $id): array
    {
        $producto = $this->productoConfiteriaRepository->buscarPorId($id);
        if ($producto === null) {
            return [
                'ok' => false,
                'mensaje' => 'Producto no encontrado.',
                'codigo_http' => 404,
            ];
        }

        if ($this->productoConfiteriaRepository->existeEnReservas($id)) {
            return [
                'ok' => false,
                'mensaje' => 'No se puede eliminar: el producto está asociado a reservas.',
                'codigo_http' => 422,
            ];
        }

        $this->productoConfiteriaRepository->eliminar($producto);

        return ['ok' => true];
    }

    public function cambiarEstado(int $id, string $estado): ?array
    {
        $producto = $this->productoConfiteriaRepository->buscarPorId($id);
        if ($producto === null) {
            return null;
        }

        $this->productoConfiteriaRepository->actualizar($producto, ['estado' => $estado]);

        return $this->serializar($producto->fresh());
    }

    /**
     * @return array<string, mixed>
     */
    private function serializar(ProductoConfiteria $p): array
    {
        return [
            'id' => (int) $p->id,
            'nombre' => (string) $p->nombre,
            'descripcion' => $p->descripcion,
            'precio' => (float) $p->precio,
            'imagen_url' => $p->imagen_url,
            'estado' => (string) $p->estado,
            'metadata' => $p->metadata,
            'created_at' => $p->created_at?->toIso8601String(),
            'updated_at' => $p->updated_at?->toIso8601String(),
        ];
    }
}

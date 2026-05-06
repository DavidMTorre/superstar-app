<?php

namespace App\Services;

use App\Models\Combo;
use App\Models\ProductoConfiteria;
use App\Repositories\ComboProductoRepository;
use App\Repositories\ComboRepository;
use App\Repositories\ProductoConfiteriaRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ComboService
{
    public function __construct(
        private readonly ComboRepository $comboRepository,
        private readonly ComboProductoRepository $comboProductoRepository,
        private readonly ProductoConfiteriaRepository $productoConfiteriaRepository
    ) {}

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function listarParaAdmin(): Collection
    {
        return $this->comboRepository->obtenerTodos()
            ->map(fn (Combo $c) => $this->serializarAdmin($c));
    }

    /**
     * @param  array{
     *     nombre: string,
     *     precio: float|int|string,
     *     estado?: string|null,
     *     productos: list<array{producto_id: int, cantidad: int}>
     * }  $datos
     * @return array{ok: true, combo: array<string, mixed>}|array{ok: false, mensaje: string}
     */
    public function crearCombo(array $datos): array
    {
        $validacion = $this->validarProductosCombo($datos['productos']);
        if ($validacion !== null) {
            return ['ok' => false, 'mensaje' => $validacion];
        }

        try {
            /** @var Combo $combo */
            $combo = DB::transaction(function () use ($datos): Combo {
                $combo = $this->comboRepository->crear([
                    'nombre' => $datos['nombre'],
                    'precio' => number_format((float) $datos['precio'], 2, '.', ''),
                    'estado' => $datos['estado'] ?? 'disponible',
                ]);
                $this->comboProductoRepository->sincronizarProductos($combo, $datos['productos']);

                return $combo->fresh(['productos']);
            });
        } catch (\Throwable $e) {
            report($e);

            return ['ok' => false, 'mensaje' => 'No se pudo crear el combo.'];
        }

        return ['ok' => true, 'combo' => $this->serializarAdmin($combo)];
    }

    /**
     * @param  array<string, mixed>  $datos
     * @return array{ok: true, combo: array<string, mixed>}|array{ok: false, mensaje: string}
     */
    public function actualizarCombo(int $id, array $datos): array
    {
        $combo = $this->comboRepository->buscarPorId($id);
        if ($combo === null) {
            return ['ok' => false, 'mensaje' => 'Combo no encontrado.'];
        }

        if (isset($datos['productos'])) {
            $validacion = $this->validarProductosCombo($datos['productos']);
            if ($validacion !== null) {
                return ['ok' => false, 'mensaje' => $validacion];
            }
        }

        try {
            DB::transaction(function () use ($combo, $datos): void {
                $attrs = [];
                if (array_key_exists('nombre', $datos)) {
                    $attrs['nombre'] = $datos['nombre'];
                }
                if (array_key_exists('precio', $datos)) {
                    $attrs['precio'] = number_format((float) $datos['precio'], 2, '.', '');
                }
                if (array_key_exists('estado', $datos) && $datos['estado'] !== null) {
                    $attrs['estado'] = $datos['estado'];
                }
                if ($attrs !== []) {
                    $this->comboRepository->actualizar($combo, $attrs);
                }
                if (isset($datos['productos'])) {
                    $this->comboProductoRepository->sincronizarProductos($combo->fresh(), $datos['productos']);
                }
            });
        } catch (\Throwable $e) {
            report($e);

            return ['ok' => false, 'mensaje' => 'No se pudo actualizar el combo.'];
        }

        $fresh = $this->comboRepository->buscarPorIdConProductos($id);
        if ($fresh === null) {
            return ['ok' => false, 'mensaje' => 'Combo no encontrado.'];
        }

        return ['ok' => true, 'combo' => $this->serializarAdmin($fresh)];
    }

    /**
     * @return array{ok: true}|array{ok: false, mensaje: string}
     */
    public function eliminarCombo(int $id): array
    {
        $combo = $this->comboRepository->buscarPorId($id);
        if ($combo === null) {
            return ['ok' => false, 'mensaje' => 'Combo no encontrado.'];
        }

        $this->comboRepository->eliminar($combo);

        return ['ok' => true];
    }

    /**
     * @param  list<array{producto_id: int, cantidad: int}>  $productos
     */
    private function validarProductosCombo(array $productos): ?string
    {
        if ($productos === []) {
            return 'El combo debe incluir al menos un producto.';
        }

        foreach ($productos as $row) {
            if ((int) $row['cantidad'] < 1) {
                return 'Cada producto del combo debe tener cantidad mayor a cero.';
            }
            $p = $this->productoConfiteriaRepository->buscarPorId((int) $row['producto_id']);
            if ($p === null) {
                return 'Uno de los productos del combo no existe.';
            }
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function serializarAdmin(Combo $c): array
    {
        $c->loadMissing('productos');

        return [
            'id' => (int) $c->id,
            'nombre' => (string) $c->nombre,
            'precio' => (float) $c->precio,
            'estado' => (string) $c->estado,
            'productos' => $c->productos->map(fn (ProductoConfiteria $p): array => [
                'id' => (int) $p->id,
                'nombre' => (string) $p->nombre,
                'cantidad' => (int) $p->pivot->cantidad,
            ])->values()->all(),
        ];
    }
}

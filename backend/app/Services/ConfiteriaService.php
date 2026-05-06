<?php

namespace App\Services;

use App\Models\Combo;
use App\Models\ProductoConfiteria;
use App\Repositories\ComboRepository;
use App\Repositories\PagoRepository;
use App\Repositories\ProductoConfiteriaRepository;
use App\Repositories\ReservaProductoRepository;
use App\Repositories\ReservaRepository;
use Illuminate\Support\Facades\DB;

class ConfiteriaService
{
    public function __construct(
        private readonly ReservaRepository $reservaRepository,
        private readonly PagoRepository $pagoRepository,
        private readonly ProductoConfiteriaRepository $productoConfiteriaRepository,
        private readonly ReservaProductoRepository $reservaProductoRepository,
        private readonly ComboRepository $comboRepository
    ) {}

    /**
     * @return list<array<string, mixed>>
     */
    public function listarProductosParaCatalogo(): array
    {
        return $this->productoConfiteriaRepository->obtenerDisponibles()
            ->map(fn (ProductoConfiteria $p): array => [
                'id' => (int) $p->id,
                'nombre' => (string) $p->nombre,
                'descripcion' => $p->descripcion,
                'precio' => (float) $p->precio,
                'imagen_url' => $p->imagen_url,
                'metadata' => $p->metadata,
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array{
     *     codigo_reserva: string,
     *     productos?: list<array{producto_id: int, cantidad: int}>,
     *     combos?: list<array{combo_id: int, cantidad: int}>
     * }  $datos
     * @return array{
     *     ok: true,
     *     precio_reserva: float,
     *     subtotal_confiteria: float,
     *     total: float
     * }|array{ok: false, mensaje: string}
     */
    public function agregarProductosAReserva(array $datos): array
    {
        $reserva = $this->reservaRepository->buscarPorCodigoReserva($datos['codigo_reserva']);

        if ($reserva === null) {
            return ['ok' => false, 'mensaje' => 'No existe una reserva con el código indicado.'];
        }

        if ($this->pagoRepository->existePagoParaReserva((int) $reserva->id)) {
            return ['ok' => false, 'mensaje' => 'Esta reserva ya está pagada.'];
        }

        $rProductos = $this->construirLineasProductosDirectos($datos['productos'] ?? []);
        if (! $rProductos['ok']) {
            return ['ok' => false, 'mensaje' => $rProductos['mensaje']];
        }

        $rCombos = $this->construirLineasDesdeCombos($datos['combos'] ?? []);
        if (! $rCombos['ok']) {
            return ['ok' => false, 'mensaje' => $rCombos['mensaje']];
        }

        $lineasProductos = $rProductos['lineas'];
        $lineasCombos = $rCombos['lineas'];

        /** @var list<array{producto_id: int, cantidad: int, precio_unitario: string, subtotal: string, origen: string}> $itemsGuardar */
        $itemsGuardar = array_merge($lineasProductos, $lineasCombos);

        if ($itemsGuardar === []) {
            return ['ok' => false, 'mensaje' => 'No hay líneas para guardar.'];
        }

        try {
            DB::transaction(function () use ($reserva, $itemsGuardar): void {
                $this->reservaProductoRepository->eliminarPorReserva((int) $reserva->id);
                $this->reservaProductoRepository->crearMultiples((int) $reserva->id, $itemsGuardar);

                $this->reservaRepository->actualizarMetadata($reserva, [
                    'confiteria' => true,
                ]);
            });
        } catch (\Throwable $e) {
            report($e);

            return ['ok' => false, 'mensaje' => 'No se pudieron guardar los productos. Intenta de nuevo.'];
        }

        $precioReserva = (float) $reserva->precio_total;
        $subtotalConfiteria = (float) $this->reservaProductoRepository->sumaSubtotalPorReserva((int) $reserva->id);
        $total = round($precioReserva + $subtotalConfiteria, 2);

        return [
            'ok' => true,
            'precio_reserva' => $precioReserva,
            'subtotal_confiteria' => $subtotalConfiteria,
            'total' => $total,
        ];
    }

    /**
     * @param  list<array{producto_id: int, cantidad: int}>  $productos
     * @return array{ok: true, lineas: list<array{producto_id: int, cantidad: int, precio_unitario: string, subtotal: string, origen: string}>}|array{ok: false, mensaje: string}
     */
    private function construirLineasProductosDirectos(array $productos): array
    {
        if ($productos === []) {
            return ['ok' => true, 'lineas' => []];
        }

        /** @var array<int, int> $cantidadesPorProducto */
        $cantidadesPorProducto = [];
        foreach ($productos as $linea) {
            $pid = (int) $linea['producto_id'];
            $cantidadesPorProducto[$pid] = ($cantidadesPorProducto[$pid] ?? 0) + (int) $linea['cantidad'];
        }

        /** @var list<array{producto_id: int, cantidad: int, precio_unitario: string, subtotal: string, origen: string}> $lineas */
        $lineas = [];

        foreach ($cantidadesPorProducto as $productoId => $cantidad) {
            $producto = $this->productoConfiteriaRepository->buscarPorId($productoId);
            if ($producto === null) {
                return ['ok' => false, 'mensaje' => 'Uno de los productos no existe.'];
            }

            $validacion = $this->validarProductoDisponible($producto);
            if ($validacion !== null) {
                return ['ok' => false, 'mensaje' => $validacion];
            }

            $precioUnit = number_format((float) $producto->precio, 2, '.', '');
            $subtotalNum = round((float) $precioUnit * $cantidad, 2);
            $subtotal = number_format($subtotalNum, 2, '.', '');

            $lineas[] = [
                'producto_id' => $productoId,
                'cantidad' => $cantidad,
                'precio_unitario' => $precioUnit,
                'subtotal' => $subtotal,
                'origen' => 'directo',
            ];
        }

        return ['ok' => true, 'lineas' => $lineas];
    }

    /**
     * @param  list<array{combo_id: int, cantidad: int}>  $combosInput
     * @return array{ok: true, lineas: list<array{producto_id: int, cantidad: int, precio_unitario: string, subtotal: string, origen: string}>}|array{ok: false, mensaje: string}
     */
    private function construirLineasDesdeCombos(array $combosInput): array
    {
        if ($combosInput === []) {
            return ['ok' => true, 'lineas' => []];
        }

        /** @var array<int, int> $cantidadesPorCombo */
        $cantidadesPorCombo = [];
        foreach ($combosInput as $linea) {
            $cid = (int) $linea['combo_id'];
            $cantidadesPorCombo[$cid] = ($cantidadesPorCombo[$cid] ?? 0) + (int) $linea['cantidad'];
        }

        /** @var list<array{producto_id: int, cantidad: int, precio_unitario: string, subtotal: string, origen: string}> $todas */
        $todas = [];

        foreach ($cantidadesPorCombo as $comboId => $cantidadCombos) {
            $combo = $this->comboRepository->buscarPorIdConProductos($comboId);
            if ($combo === null) {
                return ['ok' => false, 'mensaje' => 'Uno de los combos no existe.'];
            }

            if ($combo->estado !== 'disponible') {
                return ['ok' => false, 'mensaje' => 'El combo «'.$combo->nombre.'» no está disponible.'];
            }

            if ($combo->productos->isEmpty()) {
                return ['ok' => false, 'mensaje' => 'El combo «'.$combo->nombre.'» no tiene productos configurados.'];
            }

            $lineasCombo = $this->expandirComboAlineasReserva($combo, $cantidadCombos);
            if ($lineasCombo === null) {
                return ['ok' => false, 'mensaje' => 'No se pudo aplicar el combo «'.$combo->nombre.'» (productos no disponibles).'];
            }

            foreach ($lineasCombo as $ln) {
                $todas[] = $ln;
            }
        }

        return ['ok' => true, 'lineas' => $todas];
    }

    /**
     * Reparte el precio del combo entre productos según peso (precio catálogo × unidades).
     *
     * @return list<array{producto_id: int, cantidad: int, precio_unitario: string, subtotal: string, origen: string}>|null
     */
    private function expandirComboAlineasReserva(Combo $combo, int $cantidadCombos): ?array
    {
        $montoComboTotal = round((float) $combo->precio * $cantidadCombos, 2);

        /** @var list<array{producto: ProductoConfiteria, unidades: int, peso: float}> $filas */
        $filas = [];
        $sumaPesos = 0.0;

        foreach ($combo->productos as $p) {
            $validacion = $this->validarProductoDisponible($p);
            if ($validacion !== null) {
                return null;
            }

            $u = (int) $p->pivot->cantidad * $cantidadCombos;
            $peso = (float) $p->precio * $u;
            $sumaPesos += $peso;
            $filas[] = ['producto' => $p, 'unidades' => $u, 'peso' => $peso];
        }

        if ($sumaPesos <= 0) {
            return null;
        }

        /** @var list<array{producto_id: int, cantidad: int, precio_unitario: string, subtotal: string, origen: string}> $lineas */
        $lineas = [];
        $asignado = 0.0;
        $n = count($filas);

        foreach ($filas as $i => $row) {
            if ($i === $n - 1) {
                $sub = round($montoComboTotal - $asignado, 2);
            } else {
                $sub = round($montoComboTotal * ($row['peso'] / $sumaPesos), 2);
                $asignado += $sub;
            }

            $unidades = $row['unidades'];
            $pu = $unidades > 0 ? $sub / $unidades : 0.0;

            $lineas[] = [
                'producto_id' => (int) $row['producto']->id,
                'cantidad' => $unidades,
                'precio_unitario' => number_format($pu, 2, '.', ''),
                'subtotal' => number_format($sub, 2, '.', ''),
                'origen' => 'combo',
            ];
        }

        return $lineas;
    }

    private function validarProductoDisponible(ProductoConfiteria $producto): ?string
    {
        if ($producto->estado !== 'disponible') {
            return 'El producto «'.$producto->nombre.'» no está disponible.';
        }

        return null;
    }
}

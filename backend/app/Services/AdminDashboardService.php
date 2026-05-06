<?php

namespace App\Services;

use App\Repositories\ReservaProductoRepository;
use App\Repositories\ReservaRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\Collection;

class AdminDashboardService
{
    public function __construct(
        private readonly ReservaRepository $reservaRepository,
        private readonly ReservaProductoRepository $reservaProductoRepository,
        private readonly UserRepository $userRepository
    ) {}

    /**
     * @return array{
     *     reservas_total: int,
     *     ingresos_entradas: float,
     *     ingresos_confiteria: float,
     *     ingresos_combos: float,
     *     productos_top: list<array{nombre: string, total: int, producto_id: int}>,
     *     ventas_por_dia: list<array{fecha: string, total: float}>,
     *     total_usuarios: int
     * }
     */
    public function obtenerResumen(): array
    {
        $ventas = $this->reservaRepository->ventasPorDia();

        return [
            'reservas_total' => $this->reservaRepository->contar(),
            'ingresos_entradas' => round($this->reservaRepository->sumarIngresosEntradas(), 2),
            'ingresos_confiteria' => round($this->reservaProductoRepository->sumarSubtotalPorOrigen('directo'), 2),
            'ingresos_combos' => round($this->reservaProductoRepository->sumarSubtotalPorOrigen('combo'), 2),
            'productos_top' => $this->reservaProductoRepository->topProductos(5),
            'ventas_por_dia' => $this->formatearVentasPorDia($ventas),
            'total_usuarios' => $this->userRepository->contar(),
        ];
    }

    /**
     * @param  Collection<int, object>  $filas
     * @return list<array{fecha: string, total: float}>
     */
    private function formatearVentasPorDia(Collection $filas): array
    {
        return $filas->map(function (object $fila): array {
            return [
                'fecha' => (string) $fila->fecha,
                'total' => round((float) $fila->total, 2),
            ];
        })->values()->all();
    }
}

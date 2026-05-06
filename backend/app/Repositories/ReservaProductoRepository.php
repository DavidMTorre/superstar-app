<?php

namespace App\Repositories;

use App\Models\ProductoConfiteria;
use App\Models\ReservaProducto;
use Illuminate\Support\Facades\DB;

class ReservaProductoRepository
{
    /**
     * @param  list<array{producto_id: int, cantidad: int, precio_unitario: string, subtotal: string, origen?: string}>  $items
     */
    public function crearMultiples(int $reservaId, array $items): void
    {
        if ($items === []) {
            return;
        }

        $filas = [];
        $ahora = now();
        foreach ($items as $item) {
            $filas[] = [
                'reserva_id' => $reservaId,
                'producto_id' => $item['producto_id'],
                'cantidad' => $item['cantidad'],
                'precio_unitario' => $item['precio_unitario'],
                'subtotal' => $item['subtotal'],
                'origen' => $item['origen'] ?? 'directo',
                'created_at' => $ahora,
                'updated_at' => $ahora,
            ];
        }

        DB::table('reserva_productos')->insert($filas);
    }

    public function eliminarPorReserva(int $reservaId): void
    {
        ReservaProducto::query()->where('reserva_id', $reservaId)->delete();
    }

    public function sumaSubtotalPorReserva(int $reservaId): string
    {
        $suma = ReservaProducto::query()
            ->where('reserva_id', $reservaId)
            ->sum('subtotal');

        return number_format((float) $suma, 2, '.', '');
    }

    public function sumarSubtotal(): float
    {
        return (float) ReservaProducto::query()->sum('subtotal');
    }

    public function sumarSubtotalPorOrigen(string $origen): float
    {
        return (float) ReservaProducto::query()
            ->where('origen', $origen)
            ->sum('subtotal');
    }

    /**
     * @return list<array{nombre: string, total: int, producto_id: int}>
     */
    public function topProductos(int $limite = 5): array
    {
        $filas = ReservaProducto::query()
            ->selectRaw('producto_id, SUM(cantidad) as total')
            ->groupBy('producto_id')
            ->orderByDesc('total')
            ->limit($limite)
            ->get();

        if ($filas->isEmpty()) {
            return [];
        }

        $ids = $filas->pluck('producto_id')->all();
        $nombres = ProductoConfiteria::query()
            ->whereIn('id', $ids)
            ->pluck('nombre', 'id');

        return $filas->map(function ($fila) use ($nombres): array {
            $id = (int) $fila->producto_id;

            return [
                'producto_id' => $id,
                'nombre' => (string) ($nombres[$id] ?? '—'),
                'total' => (int) $fila->total,
            ];
        })->values()->all();
    }
}

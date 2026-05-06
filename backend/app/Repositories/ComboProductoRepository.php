<?php

namespace App\Repositories;

use App\Models\Combo;

class ComboProductoRepository
{
    /**
     * @param  list<array{producto_id: int, cantidad: int}>  $productos
     */
    public function sincronizarProductos(Combo $combo, array $productos): void
    {
        /** @var array<int, array{cantidad: int}> $sync */
        $sync = [];
        foreach ($productos as $row) {
            $pid = (int) $row['producto_id'];
            $sync[$pid] = ['cantidad' => (int) $row['cantidad']];
        }

        $combo->productos()->sync($sync);
    }
}

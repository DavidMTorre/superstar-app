<?php

namespace App\Http\Controllers\Api\V1\Confiteria;

use App\Http\Controllers\Controller;
use App\Models\ProductoConfiteria;
use App\Repositories\ComboRepository;
use Illuminate\Http\JsonResponse;

class ListarCombosConfiteriaController extends Controller
{
    public function __invoke(ComboRepository $comboRepository): JsonResponse
    {
        $items = $comboRepository->obtenerDisponibles()->map(function ($combo): array {
            $combo->loadMissing('productos');

            return [
                'id' => (int) $combo->id,
                'nombre' => (string) $combo->nombre,
                'precio' => (float) $combo->precio,
                'productos' => $combo->productos->map(fn (ProductoConfiteria $p): array => [
                    'id' => (int) $p->id,
                    'nombre' => (string) $p->nombre,
                    'cantidad' => (int) $p->pivot->cantidad,
                ])->values()->all(),
            ];
        })->values()->all();

        return response()->json([
            'exito' => true,
            'datos' => $items,
        ]);
    }
}

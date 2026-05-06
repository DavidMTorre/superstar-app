<?php

namespace App\Http\Controllers\Api\V1\Confiteria;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Confiteria\ConfiteriaAgregarRequest;
use App\Services\ConfiteriaService;
use Illuminate\Http\JsonResponse;

class AgregarProductosConfiteriaController extends Controller
{
    public function __invoke(ConfiteriaAgregarRequest $request, ConfiteriaService $confiteriaService): JsonResponse
    {
        $resultado = $confiteriaService->agregarProductosAReserva($request->datosAgregar());

        if (! $resultado['ok']) {
            return response()->json([
                'exito' => false,
                'mensaje' => $resultado['mensaje'],
            ], 422);
        }

        return response()->json([
            'exito' => true,
            'mensaje' => 'Productos agregados correctamente',
            'datos' => [
                'precio_reserva' => $resultado['precio_reserva'],
                'subtotal_confiteria' => $resultado['subtotal_confiteria'],
                'total' => $resultado['total'],
            ],
        ]);
    }
}

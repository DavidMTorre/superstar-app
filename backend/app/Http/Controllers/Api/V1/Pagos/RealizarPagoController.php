<?php

namespace App\Http\Controllers\Api\V1\Pagos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Pagos\RealizarPagoRequest;
use App\Services\PagoService;
use Illuminate\Http\JsonResponse;

class RealizarPagoController extends Controller
{
    public function __invoke(RealizarPagoRequest $request, PagoService $pagoService): JsonResponse
    {
        $resultado = $pagoService->realizarPago($request->datosPago());

        if (! $resultado['ok']) {
            return response()->json([
                'exito' => false,
                'mensaje' => $resultado['mensaje'],
            ], 422);
        }

        return response()->json([
            'exito' => true,
            'datos' => [
                'pago' => $resultado['pago'],
                'ticket' => $resultado['ticket'],
            ],
            'mensaje' => 'Pago procesado correctamente',
        ], 201);
    }
}

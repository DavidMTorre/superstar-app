<?php

namespace App\Http\Controllers\Api\V1\Reservas;

use App\Exceptions\BusinessException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Reservas\CrearReservaRequest;
use App\Services\ReservaService;
use Illuminate\Http\JsonResponse;

class CrearReservaController extends Controller
{
    public function __invoke(CrearReservaRequest $request, ReservaService $reservaService): JsonResponse
    {
        try {
            $resultado = $reservaService->crearReserva($request->datosReserva());
        } catch (BusinessException $e) {
            return response()->json([
                'exito' => false,
                'mensaje' => $e->getMessage(),
            ], 422);
        }

        if (! $resultado['ok']) {
            return response()->json([
                'exito' => false,
                'mensaje' => $resultado['mensaje'],
            ], 422);
        }

        return response()->json([
            'exito' => true,
            'datos' => [
                'reserva' => $resultado['reserva'],
            ],
            'mensaje' => 'Reserva registrada correctamente',
        ], 201);
    }
}

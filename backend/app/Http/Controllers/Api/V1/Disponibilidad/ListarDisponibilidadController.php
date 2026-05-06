<?php

namespace App\Http\Controllers\Api\V1\Disponibilidad;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Disponibilidad\ListarDisponibilidadRequest;
use App\Services\DisponibilidadService;
use Illuminate\Http\JsonResponse;

class ListarDisponibilidadController extends Controller
{
    public function __invoke(ListarDisponibilidadRequest $request, DisponibilidadService $service): JsonResponse
    {
        $peliculaId = (int) $request->validated('pelicula_id');
        $fecha = (string) $request->validated('fecha');

        $resultado = $service->obtenerDisponibilidad($peliculaId, $fecha);

        if (! $resultado['ok']) {
            return response()->json([
                'exito' => false,
                'mensaje' => $resultado['mensaje'],
            ], 422);
        }

        return response()->json([
            'exito' => true,
            'datos' => $resultado['datos'],
            'mensaje' => 'Horarios disponibles',
        ]);
    }
}

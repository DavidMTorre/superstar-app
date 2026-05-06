<?php

namespace App\Http\Controllers\Api\V1\Salas;

use App\Http\Controllers\Controller;
use App\Repositories\SalaRepository;
use Illuminate\Http\JsonResponse;

class ListarSalasPublicasController extends Controller
{
    public function __invoke(SalaRepository $salaRepository): JsonResponse
    {
        $items = $salaRepository
            ->disponiblesOrdenadasPorId()
            ->map(function ($sala): array {
                $horarios = $sala->horarios->map(function ($h): array {
                    $ap = $h->hora_apertura;
                    $ci = $h->hora_cierre;
                    $apStr = is_string($ap) ? $ap : (string) $ap;
                    $ciStr = is_string($ci) ? $ci : (string) $ci;

                    return [
                        'dia_semana' => (int) $h->dia_semana,
                        'hora_apertura' => strlen($apStr) >= 5 ? substr($apStr, 0, 5) : $apStr,
                        'hora_cierre' => strlen($ciStr) >= 5 ? substr($ciStr, 0, 5) : $ciStr,
                        'activo' => (bool) $h->activo,
                    ];
                });

                return [
                    'id' => (int) $sala->id,
                    'nombre' => $sala->nombre,
                    'precio' => (float) $sala->precio,
                    'tiempo_limpieza' => (int) $sala->tiempo_limpieza,
                    'horarios' => $horarios->values()->all(),
                ];
            });

        return response()->json([
            'exito' => true,
            'datos' => [
                'salas' => $items->values()->all(),
            ],
            'mensaje' => 'Salas disponibles',
        ]);
    }
}

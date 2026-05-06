<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreSalaHorarioRequest;
use App\Http\Requests\Api\V1\Admin\UpdateSalaHorarioRequest;
use App\Services\AdminSalaHorarioService;
use Illuminate\Http\JsonResponse;

class AdminSalaHorarioController extends Controller
{
    public function index(int $salaId, AdminSalaHorarioService $service): JsonResponse
    {
        $lista = $service->listar($salaId);
        if ($lista === null) {
            return response()->json([
                'exito' => false,
                'mensaje' => 'Sala no encontrada.',
            ], 404);
        }

        return response()->json([
            'exito' => true,
            'datos' => [
                'horarios' => $lista->values()->all(),
            ],
        ]);
    }

    public function store(int $salaId, StoreSalaHorarioRequest $request, AdminSalaHorarioService $service): JsonResponse
    {
        $resultado = $service->crear($salaId, $request->validated());
        if (! $resultado['ok']) {
            return response()->json([
                'exito' => false,
                'mensaje' => $resultado['mensaje'],
            ], 422);
        }

        return response()->json([
            'exito' => true,
            'datos' => ['horario' => $resultado['horario']],
            'mensaje' => 'Horario creado.',
        ], 201);
    }

    public function update(int $salaId, int $horarioId, UpdateSalaHorarioRequest $request, AdminSalaHorarioService $service): JsonResponse
    {
        $resultado = $service->actualizar($salaId, $horarioId, $request->validated());
        if (! $resultado['ok']) {
            return response()->json([
                'exito' => false,
                'mensaje' => $resultado['mensaje'],
            ], $resultado['mensaje'] === 'Horario no encontrado.' ? 404 : 422);
        }

        return response()->json([
            'exito' => true,
            'datos' => ['horario' => $resultado['horario']],
            'mensaje' => 'Horario actualizado.',
        ]);
    }

    public function destroy(int $salaId, int $horarioId, AdminSalaHorarioService $service): JsonResponse
    {
        $resultado = $service->eliminar($salaId, $horarioId);
        if (! $resultado['ok']) {
            return response()->json([
                'exito' => false,
                'mensaje' => $resultado['mensaje'],
            ], 404);
        }

        return response()->json([
            'exito' => true,
            'mensaje' => 'Horario eliminado.',
        ]);
    }
}

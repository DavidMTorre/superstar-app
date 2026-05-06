<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreComboRequest;
use App\Http\Requests\Api\V1\Admin\UpdateComboRequest;
use App\Services\ComboService;
use Illuminate\Http\JsonResponse;

class AdminComboController extends Controller
{
    public function index(ComboService $service): JsonResponse
    {
        return response()->json([
            'exito' => true,
            'datos' => [
                'combos' => $service->listarParaAdmin()->values()->all(),
            ],
            'mensaje' => 'Listado de combos.',
        ]);
    }

    public function store(StoreComboRequest $request, ComboService $service): JsonResponse
    {
        $resultado = $service->crearCombo($request->validated());

        if (! $resultado['ok']) {
            return response()->json([
                'exito' => false,
                'mensaje' => $resultado['mensaje'],
            ], 422);
        }

        return response()->json([
            'exito' => true,
            'datos' => ['combo' => $resultado['combo']],
            'mensaje' => 'Combo creado correctamente.',
        ], 201);
    }

    public function update(UpdateComboRequest $request, int $id, ComboService $service): JsonResponse
    {
        $resultado = $service->actualizarCombo($id, $request->validated());

        if (! $resultado['ok']) {
            return response()->json([
                'exito' => false,
                'mensaje' => $resultado['mensaje'],
            ], $resultado['mensaje'] === 'Combo no encontrado.' ? 404 : 422);
        }

        return response()->json([
            'exito' => true,
            'datos' => ['combo' => $resultado['combo']],
            'mensaje' => 'Combo actualizado correctamente.',
        ]);
    }

    public function destroy(int $id, ComboService $service): JsonResponse
    {
        $resultado = $service->eliminarCombo($id);

        if (! $resultado['ok']) {
            return response()->json([
                'exito' => false,
                'mensaje' => $resultado['mensaje'],
            ], 404);
        }

        return response()->json([
            'exito' => true,
            'datos' => null,
            'mensaje' => 'Combo eliminado correctamente.',
        ]);
    }
}

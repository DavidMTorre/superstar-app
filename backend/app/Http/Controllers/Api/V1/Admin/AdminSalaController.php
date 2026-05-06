<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\PatchSalaEstadoRequest;
use App\Http\Requests\Api\V1\Admin\StoreSalaRequest;
use App\Http\Requests\Api\V1\Admin\UpdateSalaRequest;
use App\Services\AdminSalaService;
use Illuminate\Http\JsonResponse;

class AdminSalaController extends Controller
{
    public function index(AdminSalaService $service): JsonResponse
    {
        return response()->json([
            'exito' => true,
            'datos' => [
                'salas' => $service->listar()->values()->all(),
            ],
        ]);
    }

    public function store(StoreSalaRequest $request, AdminSalaService $service): JsonResponse
    {
        $sala = $service->crear($request->validated());

        return response()->json([
            'exito' => true,
            'datos' => ['sala' => $sala],
            'mensaje' => 'Sala creada correctamente.',
        ], 201);
    }

    public function update(UpdateSalaRequest $request, int $id, AdminSalaService $service): JsonResponse
    {
        $sala = $service->actualizar($id, $request->validated());

        if ($sala === null) {
            return response()->json([
                'exito' => false,
                'mensaje' => 'Sala no encontrada.',
            ], 404);
        }

        return response()->json([
            'exito' => true,
            'datos' => ['sala' => $sala],
            'mensaje' => 'Sala actualizada correctamente.',
        ]);
    }

    public function patchEstado(PatchSalaEstadoRequest $request, int $id, AdminSalaService $service): JsonResponse
    {
        $sala = $service->cambiarEstado($id, $request->validated());

        if ($sala === null) {
            return response()->json([
                'exito' => false,
                'mensaje' => 'Sala no encontrada.',
            ], 404);
        }

        return response()->json([
            'exito' => true,
            'datos' => ['sala' => $sala],
            'mensaje' => 'Estado de la sala actualizado.',
        ]);
    }
}

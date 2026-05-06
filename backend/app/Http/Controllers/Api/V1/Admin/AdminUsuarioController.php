<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\UpdateUsuarioRolRequest;
use App\Services\AdminUsuarioService;
use Illuminate\Http\JsonResponse;

class AdminUsuarioController extends Controller
{
    public function index(AdminUsuarioService $service): JsonResponse
    {
        return response()->json([
            'exito' => true,
            'datos' => [
                'usuarios' => $service->listar()->values()->all(),
            ],
        ]);
    }

    public function updateRol(UpdateUsuarioRolRequest $request, int $id, AdminUsuarioService $service): JsonResponse
    {
        $usuario = $service->actualizarRol($id, $request->validated()['rol']);

        if ($usuario === null) {
            return response()->json([
                'exito' => false,
                'mensaje' => 'Usuario no encontrado.',
            ], 404);
        }

        return response()->json([
            'exito' => true,
            'datos' => ['usuario' => $usuario],
            'mensaje' => 'Rol actualizado correctamente.',
        ]);
    }
}

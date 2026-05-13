<?php

namespace App\Http\Controllers\Api\V1\Perfil;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Perfil\CambiarPasswordRequest;
use App\Models\User;
use App\Services\PerfilService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PerfilController extends Controller
{
    public function show(Request $request, PerfilService $perfilService): JsonResponse
    {
        /** @var User $usuario */
        $usuario = $request->user();

        return response()->json([
            'exito' => true,
            'datos' => $perfilService->serializarPerfil($usuario),
        ]);
    }

    public function updatePassword(CambiarPasswordRequest $request, PerfilService $perfilService): JsonResponse
    {
        /** @var User $usuario */
        $usuario = $request->user();

        $resultado = $perfilService->cambiarPassword($usuario, $request->validated());

        if (! $resultado['ok']) {
            return response()->json([
                'exito' => false,
                'mensaje' => $resultado['mensaje'],
            ], 422);
        }

        return response()->json([
            'exito' => true,
            'mensaje' => 'Contraseña actualizada correctamente',
        ]);
    }

    public function reservas(Request $request, PerfilService $perfilService): JsonResponse
    {
        /** @var User $usuario */
        $usuario = $request->user();

        return response()->json([
            'exito' => true,
            'datos' => $perfilService->historialReservas($usuario),
        ]);
    }
}

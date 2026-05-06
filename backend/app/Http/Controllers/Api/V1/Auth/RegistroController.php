<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\RegistroRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;

class RegistroController extends Controller
{
    public function __invoke(RegistroRequest $request, AuthService $authService): JsonResponse
    {
        $datos = $authService->registrarUsuario($request->validated());

        return response()->json([
            'exito' => true,
            'datos' => $datos,
            'mensaje' => 'Usuario registrado correctamente',
        ], 201);
    }
}

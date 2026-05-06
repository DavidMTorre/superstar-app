<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request, AuthService $authService): JsonResponse
    {
        $validados = $request->validated();

        /** @var User|null $usuario */
        $usuario = $authService->validarCredenciales($validados['correo'], $validados['contraseña']);

        if ($usuario === null) {
            return response()->json([
                'exito' => false,
                'mensaje' => 'Credenciales incorrectas',
            ], 401);
        }

        $usuario->tokens()->delete();
        $token = $usuario->createToken('spa')->plainTextToken;

        return response()->json([
            'exito' => true,
            'datos' => [
                'usuario' => $authService->usuarioPublico($usuario),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            'mensaje' => 'Inicio de sesión exitoso',
        ]);
    }
}

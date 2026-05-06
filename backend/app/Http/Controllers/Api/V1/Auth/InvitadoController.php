<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\InvitadoRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;

class InvitadoController extends Controller
{
    public function __invoke(InvitadoRequest $request, AuthService $authService): JsonResponse
    {
        return response()->json([
            'exito' => true,
            'datos' => $authService->crearSesionInvitado(),
            'mensaje' => 'Sesión de invitado iniciada',
        ]);
    }
}

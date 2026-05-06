<?php

namespace App\Http\Controllers\Api\V1\Accesos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Accesos\ValidarAccesoRequest;
use App\Services\AccesoService;
use Illuminate\Http\JsonResponse;

class ValidarAccesoController extends Controller
{
    public function __invoke(ValidarAccesoRequest $request, AccesoService $accesoService): JsonResponse
    {
        $resultado = $accesoService->validarAcceso($request->datosValidacion());

        if (! $resultado['ok']) {
            return response()->json([
                'exito' => false,
                'mensaje' => $resultado['mensaje'],
            ], 422);
        }

        return response()->json([
            'exito' => true,
            'mensaje' => 'Acceso permitido',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Confiteria;

use App\Http\Controllers\Controller;
use App\Services\ConfiteriaService;
use Illuminate\Http\JsonResponse;

class ListarProductosConfiteriaController extends Controller
{
    public function __invoke(ConfiteriaService $confiteriaService): JsonResponse
    {
        $productos = $confiteriaService->listarProductosParaCatalogo();

        return response()->json([
            'exito' => true,
            'datos' => $productos,
        ]);
    }
}

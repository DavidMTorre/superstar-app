<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminEstadisticasService;
use Illuminate\Http\JsonResponse;

class AdminEstadisticasController extends Controller
{
    public function __invoke(AdminEstadisticasService $service): JsonResponse
    {
        return response()->json([
            'exito' => true,
            'datos' => $service->resumen(),
        ]);
    }
}

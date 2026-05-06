<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminDashboardService;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function __invoke(AdminDashboardService $service): JsonResponse
    {
        return response()->json([
            'exito' => true,
            'datos' => $service->obtenerResumen(),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\HealthCheckRequest;
use App\Services\HealthService;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function __invoke(HealthCheckRequest $request, HealthService $healthService): JsonResponse
    {
        return response()->json($healthService->getHealthPayload());
    }
}

<?php

namespace App\Services;

use App\Repositories\HealthRepository;

/**
 * Reglas de negocio y orquestación. Los controllers solo delegan aquí.
 */
class HealthService
{
    public function __construct(
        private readonly HealthRepository $healthRepository
    ) {}

    /**
     * @return array{status: string, timestamp: string, application: array{name: string, environment: string}}
     */
    public function getHealthPayload(): array
    {
        return [
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'application' => $this->healthRepository->getApplicationMeta(),
        ];
    }
}

<?php

namespace App\Repositories;

/**
 * Acceso a datos / fuentes externas para estado del sistema.
 * Aquí vive la persistencia (Eloquent, APIs, caché); sin reglas de negocio.
 */
class HealthRepository
{
    /**
     * @return array{name: string, environment: string}
     */
    public function getApplicationMeta(): array
    {
        return [
            'name' => (string) config('app.name'),
            'environment' => (string) config('app.env'),
        ];
    }
}

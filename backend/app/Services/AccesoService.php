<?php

namespace App\Services;

/**
 * Validación de acceso histórica (POST /accesos/validar); delega en {@see TicketService}.
 */
class AccesoService
{
    public function __construct(
        private readonly TicketService $ticketService
    ) {}

    /**
     * @param  array{codigo_qr: string}  $datos
     * @return array{ok: true}|array{ok: false, mensaje: string}
     */
    public function validarAcceso(array $datos): array
    {
        return $this->ticketService->validarParaAccesoLegacy(trim($datos['codigo_qr']));
    }
}

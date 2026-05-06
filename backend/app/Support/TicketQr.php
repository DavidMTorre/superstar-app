<?php

namespace App\Support;

use App\Models\Reserva;

/**
 * Generación y verificación de códigos HMAC para tickets QR (integridad sin exponer datos sensibles).
 */
final class TicketQr
{
    public static function generar(Reserva $reserva): string
    {
        $payload = $reserva->codigo_reserva.'|'.$reserva->id;
        $binario = hash_hmac('sha256', $payload, (string) config('app.key'), true);

        return rtrim(strtr(base64_encode($binario), '+/', '-_'), '=');
    }

    public static function coincide(Reserva $reserva, string $codigoQr): bool
    {
        $codigoQr = trim($codigoQr);

        if ($codigoQr === '') {
            return false;
        }

        return hash_equals(self::generar($reserva), $codigoQr);
    }
}

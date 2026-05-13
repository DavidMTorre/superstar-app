# Tickets y código QR

## Objetivo

Entregar **tickets digitales verificables** con **QR visual** generado en servidor, **vista pública de ticket** y **validación controlada** para personal autorizado, evitando reutilización y aceptando expiración por horario de función.

## Descripción

| Componente | Responsabilidad |
|------------|-----------------|
| `App\Support\TicketQr` | Generación y verificación HMAC del token respecto a la reserva. |
| `PagoService` | Tras pago simulado: persiste `codigo_ticket_qr` en `pagos`, copia token en `reservas.token_qr`, devuelve `qr_imagen` (PNG o SVG base64). |
| `TicketService` | URL del QR (`FRONTEND_URL/ticket/{token}`), serialización pública, validación empleado/admin y compatibilidad con `AccesoService` legacy. |
| Paquete `simplesoftwareio/simple-qrcode` | Generación de imagen QR en backend (PNG si `ext-gd`; si no, SVG en data URI). |

## Flujo cliente

1. Pago confirmado → respuesta incluye `datos.ticket.qr_imagen` y enlace a ticket completo.
2. Ruta pública SPA `/ticket/:token` → `GET /api/v1/tickets/{token}` muestra diseño tipo ticket y `<img src={qr_imagen}>`.
3. El QR codifica una **URL absoluta** al frontend para escaneo con cámara.

## Flujo empleado

1. Ruta `/admin/validar-ticket` con **html5-qrcode** (solo captura; sin validación en cliente).
2. `POST /api/v1/tickets/validar` con Bearer **admin** Sanctum.
3. Respuestas: acceso autorizado, inválido, ya utilizado, función finalizada (expirado).

## Prevención de reutilización

- Transacción con `lockForUpdate` sobre la reserva.
- Campos `ticket_usado`, `hora_ingreso`, `estado` (`utilizada`), `fecha_uso_acceso` según migraciones y servicio.

## Validación legacy

- `POST /api/v1/accesos/validar` sigue disponible; la lógica se alinea con `TicketService` para un solo criterio de negocio.

## Documentación relacionada

- [04-pagos.md](../04-pagos.md)
- [05-accesos.md](../05-accesos.md)
- [pruebas/pruebas_qr.md](../pruebas/pruebas_qr.md)

## Conclusión

El sistema QR cumple **integridad** (HMAC), **trazabilidad** de primer uso y **separación** entre emisión (público/pago) y consumo validado (rol admin).

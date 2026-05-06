# Validación de acceso por código QR — MiniCine Superstar

## Descripción funcional

El personal de sala (o torniquete digital) envía el **payload escaneado del QR** al backend. El sistema:

1. Localiza el **pago** asociado al código almacenado (`pagos.codigo_ticket_qr`).
2. Verifica la **integridad HMAC** respecto a la reserva (`TicketQr::coincide`).
3. Comprueba que el **pago esté confirmado** (`pagado`) y que la reserva tenga **`metadata.pago_estado = pagado`**.
4. Comprueba que el ticket **no haya sido usado** (`reservas.fecha_uso_acceso` nulo y estado distinto de `utilizada`).
5. En una **transacción** con bloqueo pesimista (`lockForUpdate`), marca la reserva como **`utilizada`** y registra **`fecha_uso_acceso`**.

Así se evita el doble ingreso concurrente y se mantiene trazabilidad del primer uso del ticket.

## Endpoint

| Elemento | Valor |
|----------|-------|
| Método | `POST` |
| Ruta | `/api/v1/accesos/validar` |
| Nombre | `api.v1.accesos.validar` |

### Cuerpo JSON

| Campo | Descripción |
|-------|-------------|
| `codigo_qr` | Cadena emitida en `datos.ticket.codigo_qr` al confirmar el pago (también persistida en `pagos.codigo_ticket_qr`). |

### Respuesta exitosa (HTTP 200)

```json
{
  "exito": true,
  "mensaje": "Acceso permitido"
}
```

### Errores (HTTP 422)

| Situación | Mensaje |
|-----------|---------|
| Código no emitido o alterado | `QR inválido.` |
| Inconsistencia de datos | `Reserva no encontrada.` |
| Pago no confirmado | `La reserva no está pagada.` |
| Ticket ya utilizado | `Este ticket ya fue utilizado.` |

Las respuestas usan `{ "exito": false, "mensaje": "..." }`. Los errores de **validación** del Form Request mantienen el formato estándar del API (`Error de validación`, `errores`, etc.).

## Validaciones (Form Request)

`ValidarAccesoRequest`:

- `codigo_qr`: obligatorio, cadena, longitud entre 1 y 2048 caracteres.

## Capas

| Capa | Componente |
|------|------------|
| Controller | `ValidarAccesoController` |
| Request | `ValidarAccesoRequest` |
| Service | `AccesoService` |
| Repository | `AccesoRepository` |
| Soporte criptográfico | `App\Support\TicketQr` (HMAC-SHA256 + Base64 URL-safe) |

El controlador **no** contiene reglas de negocio; solo traduce el resultado del servicio a JSON y códigos HTTP.

## Pruebas automatizadas

Archivo: `tests/Feature/Api/V1/Accesos/AccesoApiTest.php`

| Caso | Descripción |
|------|-------------|
| `test_acceso_valido` | Pago completo → validación → estado `utilizada` y `fecha_uso_acceso` establecida. |
| `test_qr_invalido` | Código inexistente en base de datos. |
| `test_acceso_duplicado` | Segunda validación del mismo código → rechazo. |
| `test_reserva_no_pagada` | Pago en estado `pendiente` con código generado → rechazo. |

Ejecución:

```bash
php artisan test --filter=AccesoApiTest
```

## Alineación con estándares ISO

### ISO/IEC 27001 (seguridad de la información)

- **Integridad:** el código QR se basa en **HMAC** con la clave de aplicación; la coincidencia se verifica frente a la reserva asociada al pago.
- **Confidencialidad:** el endpoint debe exponerse solo en redes controladas y **HTTPS** en producción; el código es un secreto compartido entre emisor y verificador (no debe loguearse en claro en sistemas no confiables).
- **Autenticación/autorización:** la API actual no identifica al operador de torniquete; en despliegue real conviene API keys, roles o integración con directorio corporativo según la política de acceso.

### ISO/IEC/IEEE 29119 (pruebas)

Los casos cubren **camino feliz**, **entrada inválida**, **regla de negocio (no pagado)** y **idempotencia / uso único** del ticket, alineado con pruebas basadas en riesgo y criterios de aceptación explícitos.

## Dependencias de datos

La validación de acceso exige que el flujo de **pagos** haya persistido `codigo_ticket_qr` al crear el pago (ver migración `add_codigo_ticket_y_uso_acceso`). Sin ese vínculo no es posible resolver el código escaneado en tiempo constante.

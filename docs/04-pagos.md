# Pagos y ticket QR — MiniCine Superstar

## Descripción funcional

El módulo permite **registrar un pago asociado a una reserva existente**, utilizando un método de pago admitido (Yape, Plin, tarjeta o efectivo). Al completarse correctamente:

1. Se crea un registro en la tabla **`pagos`** con estado **`pagado`** y **`fecha_pago`** actual.
2. Se actualiza **`metadata.pago_estado`** de la reserva a **`pagado`**.
3. Se genera un **código único** (`codigo_qr` / `token_qr`) con **`App\Support\TicketQr`** (HMAC-SHA256 sobre `codigo_reserva|id`), se **persiste** en **`pagos.codigo_ticket_qr`** y se **replica** en **`reservas.token_qr`** para resolución rápida y enlaces de ticket.

La restricción **`UNIQUE` sobre `reserva_id`** impide más de un pago por reserva a nivel de base de datos; la capa de aplicación valida previamente para devolver un mensaje controlado.

## Endpoint

| Elemento | Valor |
|----------|-------|
| Método | `POST` |
| Ruta | `/api/v1/pagos` |
| Nombre | `api.v1.pagos.store` |

### Cuerpo JSON

| Campo | Descripción |
|-------|-------------|
| `codigo_reserva` | UUID de la reserva (`reservas.codigo_reserva`). |
| `metodo_pago` | Uno de: `yape`, `plin`, `tarjeta`, `efectivo`. |
| `monto` | Decimal mayor que `0` (importe cobrado). |

### Respuesta exitosa (HTTP 201)

```json
{
  "exito": true,
  "datos": {
    "pago": {
      "id": 1,
      "reserva_id": 1,
      "metodo_pago": "yape",
      "estado": "pagado",
      "monto": 45.5,
      "fecha_pago": "2026-06-01T10:00:00+00:00"
    },
    "ticket": {
      "codigo_reserva": "550e8400-e29b-41d4-a716-446655440000",
      "codigo_qr": "<token_hmac_urlsafe>",
      "token_qr": "<token_hmac_urlsafe>",
      "qr_imagen": "data:image/png;base64,..."
    }
  },
  "mensaje": "Pago procesado correctamente"
}
```

> `qr_imagen` es una **data URI** generada en servidor (`simplesoftwareio/simple-qrcode`). Con **ext-gd** se usa PNG; sin GD, SVG en base64 (compatible con `<img>`).

### Errores habituales (HTTP 422)

- Validación (Form Request): formato UUID, reserva inexistente, método inválido, monto incorrecto.
- Negocio (servicio): **pago duplicado** para la misma reserva (mensaje en cuerpo, sin `datos`).

## Validaciones

Definidas en `App\Http\Requests\Api\V1\Pagos\RealizarPagoRequest` (extiende `ApiFormRequest` para el formato de error 422 unificado del API).

- `codigo_reserva`: obligatorio, debe ser **UUID** y **existir** en `reservas.codigo_reserva`.
- `metodo_pago`: obligatorio, **solo** valores permitidos (`yape`, `plin`, `tarjeta`, `efectivo`).
- `monto`: obligatorio, numérico, mínimo **0.01**.

Reglas de negocio en **`PagoService`**:

- La reserva debe existir (refuerzo tras la validación).
- No debe existir ya un **pago** para esa `reserva_id` (duplicados).

## Pruebas realizadas

Archivo: `tests/Feature/Api/V1/Pagos/RealizarPagoApiTest.php`

| Caso | Descripción |
|------|-------------|
| `test_pago_exitoso` | Flujo completo: filas en `pagos`, metadata de reserva, `ticket.qr_imagen`, `reservas.token_qr` alineado con `codigo_ticket_qr`. |
| `test_reserva_inexistente` | UUID válido no registrado → 422 de validación (`exists`). |
| `test_pago_duplicado` | Segundo intento sobre la misma reserva → 422 desde servicio. |
| `test_metodo_invalido` | Método fuera del conjunto permitido → 422 de validación. |

Ejecución recomendada:

```bash
php artisan test --filter=RealizarPagoApiTest
```

## Relación con estándares ISO

### ISO/IEC 25000 (SQuaRE — calidad del software)

Los requisitos funcionales (registro de pago, idempotencia por reserva, actualización de estado de reserva) se **verifican** con pruebas de API que comueban el comportamiento observado. El contrato JSON (`exito`, `datos`, `mensaje`) facilita la **evaluación** de adecuación funcional y consistencia con el resto del sistema.

### ISO/IEC/IEEE 29119 (pruebas de software)

Las pruebas de feature con **PHPUnit** cubren casos positivo, validación de entrada, regla de negocio (duplicado) y regresión al evolucionar el módulo. Se alinean con el enfoque de **pruebas basadas en requisitos** y criterios de aceptación explícitos.

### ISO/IEC 27001 (gestión de seguridad de la información)

**Contexto de control:** el código de ticket se genera con **HMAC** y la clave de aplicación; no se almacena la clave en la base de datos. **No obstante**, el endpoint actual no exige autenticación del pagador: en entornos reales se deben combinar **TLS**, **autenticación** (p. ej. token), **autorización** sobre la reserva y **registro de auditoría** según la política de seguridad de la organización. La tabla `pagos` y la unicidad por `reserva_id` apoyan **integridad** y trazabilidad básica.

## Modelo de datos (tabla `pagos`)

| Campo | Tipo / notas |
|-------|----------------|
| `id` | Autoincremental |
| `reserva_id` | FK a `reservas`, **único** |
| `metodo_pago` | Cadena indexada |
| `estado` | `pagado` / `pendiente` (en creación vía API se usa `pagado`) |
| `monto` | Decimal (10,2) |
| `fecha_pago` | Timestamp (null permitido en esquema; se rellena al pagar) |

## Componentes principales

| Capa | Clase |
|------|--------|
| Controller | `RealizarPagoController` |
| Request | `RealizarPagoRequest` |
| Service | `PagoService` |
| Repositories | `PagoRepository`, `ReservaRepository` (búsqueda por código y actualización de metadata) |
| Model | `Pago` |

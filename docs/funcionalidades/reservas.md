# Reservas

## Objetivo

Permitir **reservar una función** (película + sala + franja horaria + número de personas) con validación de negocio en servidor: disponibilidad real, solapamiento, límites de sala y horarios de atención.

## Descripción

El flujo cubre usuarios **registrados** (`usuario_id`) e **invitados** (`guest_id`). La reserva persiste en la tabla `reservas` con código único (`codigo_reserva`, UUID), precio total calculado según sala y metadatos de estado de pago.

## Flujo (usuario)

1. Desde la cartelera, el usuario elige una película → `/reserva/:peliculaId`.
2. Selecciona **fecha** y consulta disponibilidad: `GET /api/v1/disponibilidad?pelicula_id=&fecha=`.
3. Elige **sala**, **hora de inicio** (y fin implícita según duración + limpieza) y **cantidad de personas**.
4. Confirma → `POST /api/v1/reservas` con el payload validado.
5. Opcional: confitería y pago en pasos posteriores.

## Validaciones (backend)

Implementadas en `CrearReservaRequest` y en `ReservaService` / `DisponibilidadService`:

- Película disponible, sala activa, franja dentro del horario de la sala.
- **Sin solapamiento** con otras reservas el mismo día en la misma sala.
- Capacidad de sala respecto a `cantidad_personas`.

## “Asientos”

El dominio actual modela **capacidad por reserva** (`cantidad_personas`) frente a la sala; **no** hay mapa gráfico de butacas numeradas. El ticket muestra “asientos” como **número de personas** admitidas en la reserva (coherente con el modelo de datos).

## Confirmación

- Respuesta **201 Created** con resumen de reserva (código, fechas, sala, importes según implementación del controlador/servicio).
- El cliente puede redirigir a confitería o pago con el `codigo_reserva` en estado.

## Pruebas asociadas

- `tests/Feature/Api/V1/Reservas/ReservasApiTest.php`
- `tests/Feature/Api/V1/Disponibilidad/DisponibilidadApiTest.php`

## Conclusión

Las reservas son el **núcleo transaccional** del negocio; su correctitud depende exclusivamente del backend, cumpliendo el principio de que React actúa solo como presentación.

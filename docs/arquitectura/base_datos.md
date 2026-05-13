# Base de datos

## Objetivo

Resumir el **modelo de datos** lógico y las relaciones principales del dominio cine.

## Entidades principales

| Tabla | Rol |
|-------|-----|
| `users` | Clientes y administradores; rol, perfil, hash de contraseña. |
| `personal_access_tokens` | Tokens Sanctum. |
| `peliculas` | Catálogo de películas. |
| `salas` | Salas con precio base y tiempo de limpieza. |
| `sala_horarios` | Franjas de atención por día de semana. |
| `reservas` | Reserva de función; `codigo_reserva`, fechas, `user_id` / `guest_id`, `token_qr`, `ticket_usado`, `hora_ingreso`, `fecha_uso_acceso`. |
| `pagos` | Pago simulado por reserva; `codigo_ticket_qr` único. |
| `productos_confiteria` | Catálogo snacks. |
| `reserva_productos` | Líneas de venta asociadas a reserva. |
| `combos` + tablas pivote | Combos (según migraciones del proyecto). |

## Relaciones (lectura rápida)

- `reservas` → `users` (opcional), `peliculas`, `salas`.
- `pagos` → `reservas` (1:1 lógico con unique `reserva_id`).
- `reserva_productos` → `reservas`, `productos_confiteria`.

## Detalle de columnas

Para inventario exhaustivo por migración, ver [anexos/estructura_bd.md](../anexos/estructura_bd.md).

## Conclusión

El esquema soporta **reserva → confitería → pago → ticket → uso único**, trazable para informes del dashboard.

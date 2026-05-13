# Anexo — Endpoints API (`/api/v1`)

## Objetivo

Inventario de rutas **implementadas** a fecha de documentación. Los cuerpos exactos pueden consultarse en los Form Requests y tests de feature correspondientes.

## Público (sin Bearer)

| Método | Ruta | Nombre aproximado |
|--------|------|-------------------|
| `GET` | `/api/v1/health` | Salud del servicio |
| `GET` | `/api/v1/peliculas` | Listado / destacados / búsqueda según query |
| `GET` | `/api/v1/peliculas/buscar` | Búsqueda con validación |
| `GET` | `/api/v1/salas` | Salas públicas |
| `GET` | `/api/v1/disponibilidad` | Slots reservables |
| `POST` | `/api/v1/reservas` | Crear reserva |
| `GET` | `/api/v1/confiteria/productos` | Catálogo productos |
| `GET` | `/api/v1/confiteria/combos` | Catálogo combos |
| `POST` | `/api/v1/confiteria/agregar` | Líneas a reserva |
| `POST` | `/api/v1/pagos` | Pago simulado |
| `GET` | `/api/v1/tickets/{token}` | Detalle ticket + `qr_imagen` |
| `POST` | `/api/v1/accesos/validar` | Validación legacy por `codigo_qr` |
| `POST` | `/api/v1/auth/registro` | Registro |
| `POST` | `/api/v1/auth/login` | Login (devuelve token Sanctum) |
| `POST` | `/api/v1/auth/invitado` | `guest_id` |

## Usuario autenticado (`Authorization: Bearer`)

| Método | Ruta | Notas |
|--------|------|--------|
| `GET` | `/api/v1/perfil` | Perfil |
| `PUT` | `/api/v1/perfil/password` | Cambio contraseña |
| `GET` | `/api/v1/perfil/reservas` | Próximas + historial |

## Administrador (`Bearer` + rol admin)

| Prefijo | Ejemplos |
|---------|----------|
| `/api/v1/admin/dashboard` | `GET` |
| `/api/v1/admin/estadisticas` | `GET` |
| `/api/v1/admin/peliculas` | CRUD |
| `/api/v1/admin/reservas` | `GET` |
| `/api/v1/admin/usuarios` | `GET`, `PUT .../rol` |
| `/api/v1/admin/salas` | CRUD + estado |
| `/api/v1/admin/salas/{id}/horarios` | CRUD |
| `/api/v1/admin/combos` | CRUD |
| `/api/v1/admin/confiteria/productos` | CRUD + estado |
| `POST` | `/api/v1/tickets/validar` | Validación empleado (cuerpo `token_qr`) |

## Códigos HTTP frecuentes

| Código | Uso |
|--------|-----|
| `200` | Éxito lectura o validación OK |
| `201` | Recurso creado (registro, reserva, pago) |
| `401` | No autenticado |
| `403` | Autenticado sin permiso |
| `404` | Ticket público inexistente |
| `422` | Validación o regla de negocio con mensaje |

## Conclusión

Este anexo debe actualizarse cuando se añadan rutas nuevas en `routes/api.php`.

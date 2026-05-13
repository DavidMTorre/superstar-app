# Perfil de usuario

## Objetivo

Que el usuario **autenticado** consulte su perfil, **cambie su contraseña** y visualice **próximas funciones** e **historial de reservas** con detalle de confitería y enlace a ticket cuando exista pago.

## Descripción

Todas las rutas bajo el prefijo `/api/v1/perfil` requieren **`auth:sanctum`**. Solo se opera sobre el usuario de la petición; no se expone modificación de correo ni de roles desde este módulo.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/perfil` | Datos básicos: id, nombre, correo, fecha de registro. |
| `PUT` | `/api/v1/perfil/password` | Cambio de contraseña con validación (`password_actual`, `password_nueva`, confirmación). |
| `GET` | `/api/v1/perfil/reservas` | Partición en `proximas` y `historial` según fecha de función. |

## Flujo (SPA)

- Ruta `/perfil` (requiere sesión válida en cliente).
- Página `PerfilPage.jsx`: carga paralela de perfil e historial; formulario de contraseña con mensajes de error del backend (`422`).

## Edición de perfil

- **Nombre y correo:** la edición de identidad **no** está expuesta como API de perfil en la versión actual; el usuario ve datos sincronizados con el servidor al cargar `GET /perfil`.
- **Contraseña:** único flujo de actualización de credenciales autenticado documentado aquí.

## Recuperación de contraseña (alcance)

- **No implementado** como flujo de “olvidé mi contraseña” con correo electrónico o token de un solo uso en la API actual.
- La tabla `password_reset_tokens` existe por convención Laravel; un flujo futuro podría añadirse sin romper el contrato de capas.

## Tickets e historial

- Cada ítem puede incluir `qr_url` apuntando al ticket público del SPA (`FRONTEND_URL/ticket/{token}`) y metadatos de pago.
- Ver también [tickets_qr.md](tickets_qr.md).

## Pruebas asociadas

- `tests/Feature/Api/V1/Perfil/PerfilApiTest.php`

## Conclusión

El módulo de perfil cumple **trazabilidad** del cliente y **separación de privilegios** respecto al panel administrador.

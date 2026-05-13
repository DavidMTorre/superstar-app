# API REST — visión de arquitectura

## Objetivo

Documentar decisiones de **diseño** del API: versionado, seguridad transversal y extensibilidad.

## Versionado

- Todas las rutas de negocio bajo **`/api/v1`**.
- Evolución futura: introducir `/api/v2` sin romper clientes legacy.

## Seguridad por capas

| Capa | Mecanismo |
|------|-----------|
| Transporte | TLS obligatorio en producción. |
| Autenticación | Sanctum Bearer para rutas privadas. |
| Autorización | Middleware `auth:sanctum` + `es_admin` en prefijos admin y validación de tickets. |
| Integridad datos | Transacciones DB, restricciones UNIQUE, HMAC en tokens QR. |

## Consistencia de errores

- Validación: **422** + `errores` (Laravel Validator vía `ApiFormRequest`).
- Negocio controlado: **422** con `exito: false` y `mensaje` (p. ej. pago duplicado).
- Autenticación: **401**; autorización: **403**; no encontrado ticket público: **404**.

## Extensibilidad

- Nuevos módulos: añadir `Route::prefix` o controladores invocables siguiendo la misma jerarquía de carpetas `Api/V1/...`.

## Referencia de rutas

- Listado tabular: [anexos/endpoints_api.md](../anexos/endpoints_api.md).
- Uso desde cliente: [../funcionalidades/api_rest.md](../funcionalidades/api_rest.md).

## Conclusión

El diseño del API favorece **contratos explícitos** y separación entre **público**, **usuario autenticado** y **administración**.

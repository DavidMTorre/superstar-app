# Uso de la API REST (visión funcional)

## Objetivo

Describir cómo **consumen** la API los clientes (SPA React, herramientas de prueba, integraciones futuras) respetando el contrato común del proyecto.

## Descripción

- **Base path:** `/api/v1` (prefijo `api` de Laravel + grupo `v1` en `routes/api.php`).
- **Formato:** JSON con cabecera `Content-Type: application/json` y `Accept: application/json`.
- **Convención de éxito:** `exito: true`, objeto `datos`, `mensaje` opcional.
- **Errores de validación:** HTTP **422**, `exito: false`, `mensaje: "Error de validación"`, objeto `errores` por campo.
- **Autenticación Sanctum:** cabecera `Authorization: Bearer {token}` en rutas protegidas.

## Variables de entorno (frontend)

| Variable | Uso |
|----------|-----|
| `VITE_API_URL` | URL base del backend (sin barra final); si está vacía, se usan rutas relativas y proxy de Vite en desarrollo. |

## Variables de entorno (backend relevantes al dominio)

| Variable | Uso |
|----------|-----|
| `FRONTEND_URL` | Base del SPA para URLs incrustadas en QR y enlaces de ticket (`config('app.frontend_url')`). |

## Referencia exhaustiva de rutas

Ver [anexos/endpoints_api.md](../anexos/endpoints_api.md).

## Conclusión

Un contrato REST **estable y predecible** reduce el coste de integración y facilita revisiones de seguridad (autenticación, rate limiting y TLS en despliegue).

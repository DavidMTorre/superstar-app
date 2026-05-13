# Backend — Laravel

## Objetivo

Detallar la organización del **backend** y las responsabilidades de cada capa.

## Estructura de capas

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| **Controller** | `app/Http/Controllers/Api/V1/` | Orquestación HTTP, códigos de estado, delegación a Form Request y Service. |
| **Form Request** | `app/Http/Requests/Api/V1/` | Validación y mensajes; `ApiFormRequest` unifica errores 422. |
| **Service** | `app/Services/` | Reglas de negocio, transacciones, serialización hacia el contrato JSON. |
| **Repository** | `app/Repositories/` | Consultas y persistencia; sin reglas complejas de negocio. |
| **Model** | `app/Models/` | Eloquent: fillable, casts, relaciones. |
| **Middleware** | `app/Http/Middleware/` | p. ej. `EnsureUserIsAdmin`. |

## Rutas

- Definidas en `routes/api.php` con prefijo `v1`.
- Autenticación API: **Laravel Sanctum** (tokens de usuario).

## Paquetes relevantes

| Paquete | Uso |
|---------|-----|
| `laravel/sanctum` | Tokens Bearer para SPA y admin. |
| `simplesoftwareio/simple-qrcode` | Generación de QR en servidor. |

## Conclusión

El backend cumple el patrón **empresarial** Controller → Service → Repository descrito en la documentación de diseño.

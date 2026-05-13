# Arquitectura general

## Objetivo

Presentar la **visión de sistema** del producto MiniCine Superstar: componentes, comunicaciones y principios de desacoplamiento.

## Descripción

```text
┌─────────────────┐         HTTPS (JSON)          ┌─────────────────┐
│  SPA React      │ ◄──────────────────────────► │  Laravel API    │
│  (Vite)         │         /api/v1/*           │  MySQL           │
└─────────────────┘                             └─────────────────┘
        │                                                │
        │  Bearer Sanctum (admin, perfil)                 │
        └────────────────────────────────────────────────┘
```

| Capa | Tecnología | Rol |
|------|------------|-----|
| Presentación | React 19 + React Router | UI, rutas públicas y admin, consumo HTTP. |
| Aplicación / dominio | Laravel 12 | Reglas de negocio, autenticación, integridad transaccional. |
| Persistencia | MySQL (Eloquent) | Datos maestros y transaccionales. |

## Escalabilidad

- **Horizontal:** API stateless (salvo sesiones si se usan cookies web; el cliente SPA usa tokens Sanctum).
- **Vertical:** optimización de consultas y caché de segundo nivel (futuro).
- **Separación:** permite sustituir el cliente por app móvil nativa manteniendo el mismo contrato REST.

## Documentación por capa

- [backend.md](backend.md)
- [frontend.md](frontend.md)
- [base_datos.md](base_datos.md)
- [api_rest.md](api_rest.md)

## Conclusión

La arquitectura es **monolito modular** en backend (no microservicios), adecuada al alcance actual y auditable.

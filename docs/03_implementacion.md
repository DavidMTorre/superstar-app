# Implementación — MiniCine Superstar

## 1. Objetivo

Describir la **estructura real** del repositorio y el reparto de responsabilidades entre backend Laravel y frontend React, en línea con la arquitectura documentada en `02_diseno.md` y ampliada en `docs/arquitectura/`.

## 2. Estructura del backend (orientativa)

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/V1/   # Health, Auth, Peliculas, Reservas, Pagos, Tickets, Perfil, Admin, …
│   │   ├── Middleware/           # EnsureUserIsAdmin, …
│   │   └── Requests/Api/V1/      # Form Requests por dominio
│   ├── Models/                   # User, Reserva, Pago, Pelicula, …
│   ├── Repositories/             # Acceso datos (UserRepository, ReservaRepository, TicketRepository, …)
│   └── Services/                 # Lógica de negocio (AuthService, PagoService, TicketService, PerfilService, …)
├── routes/api.php
├── database/migrations/
└── tests/Feature/Api/V1/         # Pruebas HTTP por módulo
```

## 3. Estructura del frontend

```
frontend/
├── src/
│   ├── pages/           # Cartelera, Reserva, Pago, Perfil, Ticket, Login, …
│   ├── admin/         # Panel y páginas (incl. ValidarTicketPage)
│   ├── components/
│   ├── api/api.js
│   ├── hooks/
│   └── layout/
└── vite.config.js
```

## 4. Tabla de correspondencia (ejemplos)

| Funcionalidad | Controller (invocable o resource) | Request | Service | Repository |
|---------------|-----------------------------------|---------|---------|------------|
| Health | `HealthController` | `HealthCheckRequest` | `HealthService` | `HealthRepository` |
| Login | `LoginController` | `LoginRequest` | `AuthService` | `UserRepository` |
| Crear reserva | `CrearReservaController` | `CrearReservaRequest` | Servicio de reservas | `ReservaRepository`, … |
| Pago | `RealizarPagoController` | `RealizarPagoRequest` | `PagoService` | `PagoRepository`, `ReservaRepository` |
| Ticket público / validar | `TicketController` | `ValidarTicketRequest` (validar) | `TicketService` | `TicketRepository` |
| Perfil | `PerfilController` | `CambiarPasswordRequest`, … | `PerfilService` | `UserRepository`, `ReservaRepository` |

## 5. Base de datos y configuración

- Migraciones en `database/migrations/` definen el esquema (ver [anexos/estructura_bd.md](anexos/estructura_bd.md)).
- `FRONTEND_URL` en backend alimenta URLs absolutas en códigos QR.

## 6. Referencias

- Detalle por funcionalidad: `docs/funcionalidades/`.
- Pruebas: `docs/04_pruebas.md` y `docs/pruebas/`.
- Calidad: `docs/05_calidad_sonarqube.md` y `docs/calidad/`.

## 7. Conclusión

La implementación mantiene **controladores ligeros** y **reglas de negocio en servicios**, facilitando auditorías y análisis estático.

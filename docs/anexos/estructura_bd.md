# Anexo — Estructura de base de datos

## Objetivo

Orientar al lector hacia las **migraciones** como fuente de verdad del esquema físico.

## Descripción

Las definiciones completas (tipos, índices, FK, `unique`) están en:

```
backend/database/migrations/
```

## Tablas destacadas por archivo (no exhaustivo)

| Migración (ejemplo) | Contenido |
|---------------------|-----------|
| `0001_01_01_000000_create_users_table.php` | `users`, `password_reset_tokens`, `sessions` |
| `2026_05_02_100000_add_rol_to_users_table.php` | Rol administrador / cliente |
| `2026_05_03_120000_create_salas_table.php` | Salas |
| `2026_05_07_100000_create_sala_horarios_table.php` | Horarios |
| `*_create_reservas_table.php` / afines | Reservas |
| `2026_04_29_200000_create_pagos_table.php` | Pagos |
| `2026_04_29_300000_add_codigo_ticket_y_uso_acceso.php` | QR y uso |
| `2026_05_15_120000_add_ticket_qr_fields_to_reservas_table.php` | `token_qr`, `ticket_usado`, `hora_ingreso` |
| `2026_05_09_100000_create_productos_confiteria_table.php` | Productos |
| `2026_05_09_100001_create_reserva_productos_table.php` | Líneas confitería |

## Conclusión

Para diagramas ER exportables, generar desde herramienta DBA o plugin Laravel a partir de la BD desplegada.

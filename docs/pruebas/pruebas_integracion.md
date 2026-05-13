# Pruebas de integración

## Objetivo

Documentar las pruebas que validan la **interacción entre capas** (HTTP → Controller → Service → Repository → base de datos) sin mockear la persistencia salvo aislamiento por base en memoria/SQLite de test.

## Descripción

| Característica | Implementación |
|----------------|----------------|
| Aislamiento de datos | `Illuminate\Foundation\Testing\RefreshDatabase` en la mayoría de tests de API. |
| Fidelidad | Migraciones reales; restricciones UNIQUE y FK activas. |
| Contratos | Aserciones sobre JSON y filas en BD (`assertDatabaseHas`). |

## Ejemplos de integración crítica

- **Pago + token en reserva:** tras `POST /pagos`, se verifica `pagos` y `reservas.token_qr`.
- **Validación de ticket:** escaneo simulado → transacción → `ticket_usado` y `hora_ingreso`.
- **Perfil + historial:** usuario con reserva pagada y productos de confitería serializados correctamente.

## Conclusión

Las pruebas de integración demuestran que el **stack Laravel + MySQL/SQLite** mantiene coherencia transaccional en los flujos financieros y de acceso.

# Pruebas funcionales

## Objetivo

Registrar el alcance de las pruebas que verifican **comportamiento observable** del sistema desde la API y el SPA, alineadas a requisitos de negocio.

## Descripción

Las pruebas funcionales automatizadas del backend se ejecutan con **PHPUnit** sobre rutas HTTP reales (`$this->getJson`, `postJson`, etc.). Cubren autenticación, cartelera, reservas, disponibilidad, confitería, pagos, accesos, perfil, tickets QR y panel admin.

## Módulos cubiertos (extracto)

| Módulo | Archivo principal de tests |
|--------|------------------------------|
| Autenticación | `tests/Feature/Api/V1/Auth/AuthApiTest.php` |
| Películas / cartelera | `tests/Feature/Api/V1/Peliculas/PeliculasApiTest.php` |
| Reservas | `tests/Feature/Api/V1/Reservas/ReservasApiTest.php` |
| Disponibilidad | `tests/Feature/Api/V1/Disponibilidad/DisponibilidadApiTest.php` |
| Confitería | `tests/Feature/Api/V1/Confiteria/ConfiteriaApiTest.php` |
| Pagos | `tests/Feature/Api/V1/Pagos/RealizarPagoApiTest.php` |
| Accesos QR legacy | `tests/Feature/Api/V1/Accesos/AccesoApiTest.php` |
| Perfil | `tests/Feature/Api/V1/Perfil/PerfilApiTest.php` |
| Tickets | `tests/Feature/Api/V1/Tickets/TicketApiTest.php` |
| Admin | `tests/Feature/Api/V1/Admin/*.php` |

## Matriz de pruebas (plantilla — rellenar en auditoría)

| ID | Módulo | Descripción | Entrada | Resultado esperado | Resultado obtenido | Estado |
|----|--------|-------------|---------|-------------------|-------------------|--------|
| PF-01 | Auth | Login OK | Credenciales válidas | 200 + token | (ejecución) | OK |
| PF-02 | Auth | Login fallido | Contraseña errónea | 401 | (ejecución) | OK |
| PF-03 | Cartelera | Listado | GET `/peliculas` | `exito: true` | (ejecución) | OK |
| PF-04 | Reserva | Crear | POST `/reservas` válido | 201 | (ejecución) | OK |
| PF-05 | Pago | Confirmar | POST `/pagos` | 201 + `qr_imagen` | (ejecución) | OK |
| PF-06 | Ticket | Público | GET `/tickets/{token}` | 200 o 404 | (ejecución) | OK |
| PF-07 | Ticket | Validar admin | POST `/tickets/validar` | 200 / 422 según caso | (ejecución) | OK |
| PF-08 | Perfil | Historial | GET `/perfil/reservas` con Bearer | 200 + partición | (ejecución) | OK |

> Los resultados “obtenidos” deben copiarse del log de CI o de `php artisan test` en la fecha de la auditoría.

## Conclusión

Las pruebas funcionales automatizadas del backend constituyen la **línea base** de regresión; las filas de la matriz complementan evidencias para revisiones manuales o académicas.

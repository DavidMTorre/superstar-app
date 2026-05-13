# Pruebas del sistema QR y tickets

## Objetivo

Verificar generación de **imagen QR**, **detalle público de ticket** y **validación con estados** (válido, usado, inválido, expirado).

## Casos automatizados (backend)

| ID | Test (PHPUnit) | Resultado esperado |
|----|----------------|---------------------|
| Q-01 | `TicketApiTest::test_get_ticket_publico_ok` | 200, `qr_imagen` presente, datos de función. |
| Q-02 | `TicketApiTest::test_get_ticket_publico_404` | 404 ticket inexistente. |
| Q-03 | `TicketApiTest::test_generar_qr_en_respuesta_pago` | Tras pago, `qr_imagen` tipo data URI. |
| Q-04 | `TicketApiTest::test_validar_ticket_autorizado` | 200, datos de sala/película; reserva marcada usada. |
| Q-05 | `TicketApiTest::test_validar_ticket_ya_usado` | 422 mensaje ya utilizado. |
| Q-06 | `TicketApiTest::test_validar_ticket_invalido` | 422 inválido. |
| Q-07 | `TicketApiTest::test_validar_ticket_expirado` | 422 función finalizada. |
| Q-08 | `AccesoApiTest::*` | Compatibilidad endpoint legacy `/accesos/validar`. |

## Conclusión

Los tests Q-01 a Q-08 cubren **caminos felices y de error** alineados a historias de usuario de control de acceso.

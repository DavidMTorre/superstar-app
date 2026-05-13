# Refactorizaciones y mejoras documentadas

## Objetivo

Registrar cambios **no funcionales** orientados a calidad, mantenibilidad y alineación con herramientas de análisis estático.

## Descripción

| Área | Cambio | Motivación |
|------|--------|------------|
| `CarteleraPage.jsx` | `memo`, `useMemo`, `useCallback`, helper de rejilla | Menos renders y duplicación; mejora reglas tipo SonarQube sobre efectos y optional chaining. |
| `useEffect` async | Función interna `async` + cleanup | Evitar async directo en callback del efecto; patrón recomendado. |
| Tickets | Centralización en `TicketService` | Un solo lugar para expiración, uso único y compatibilidad con endpoint legacy. |
| Perfil | `qr_url` con token en ruta | URLs escaneables consistentes con el SPA `/ticket/:token`. |

## Conclusión

Las refactorizaciones se limitan al **mínimo necesario** para cumplir objetivos de calidad sin alterar el contrato de negocio observado por los tests.

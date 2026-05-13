# Resultados de pruebas automatizadas

## Objetivo

Centralizar el procedimiento y el **criterio de aceptación** de la suite de tests del backend.

## Descripción

| Comando | Directorio | Interpretación |
|---------|------------|----------------|
| `php artisan test` | `backend/` | Ejecuta toda la suite; código de salida **0** = éxito. |
| `php artisan test --filter=NombreTest` | `backend/` | Ejecuta un subconjunto durante desarrollo. |

## Estado de referencia

En el entorno de desarrollo del proyecto, la suite completa debe mantenerse en **verde** (aprox. **70+** tests de feature y unitarios de ejemplo, según versión del repositorio).

| Métrica | Objetivo |
|---------|----------|
| Tests fallidos | **0** en rama principal |
| Regresión tras cambio | Ejecutar suite completa antes de merge |

## Tabla resumen (plantilla para CI)

| ID | Módulo | Descripción | Entrada | Esperado | Obtenido (rellenar en CI) | Estado |
|----|--------|-------------|---------|-----------|---------------------------|--------|
| CI-01 | Suite completa | `php artisan test` | — | Exit 0 | (log) | OK/FAIL |
| CI-02 | Cobertura | `php artisan test --coverage` (si PCOV/Xdebug) | — | Umbral definido por política | % | OK/FAIL |

## Conclusión

Integrar el comando en **pipeline CI/CD** (GitHub Actions, GitLab CI, Azure DevOps) con publicación de informes JUnit mejora la trazabilidad para auditorías.

# SonarQube y análisis estático

## Objetivo

Describir la **compatibilidad** del código con análisis estático tipo SonarQube y las **mejoras** aplicadas para reducir deuda técnica en frontend y convenciones en backend.

## Descripción

SonarQube (o SonarCloud) analiza **calidad y seguridad** sobre reglas configurables (bugs, vulnerabilidades, code smells, duplicación, cobertura si se alimenta con reportes PHPUnit/LCOV y cobertura JS).

| Ámbito | Herramientas típicas |
|--------|----------------------|
| PHP / Laravel | SonarPHP, PHPStan (opcional), reglas PSR-12 |
| JavaScript / React | ESLint (reglas React hooks), análisis de duplicación |

## Análisis realizado (referencia del proyecto)

| Tipo | Ejemplo concreto | Mejora aplicada |
|------|------------------|-----------------|
| Fiabilidad (JS) | Efectos async inline en `useEffect` | Función `async` interna + `void` explícito; cancelación con flag. |
| Mantenibilidad | Duplicación de rejilla de películas en cartelera | Helper `gridPeliculas` + `memo` en tarjeta. |
| Bugs potenciales | Acceso a propiedades sin garantía | Optional chaining (`?.`) en serialización de datos API. |
| Seguridad API | Exposición de datos sensibles | Contraseñas nunca en JSON; tokens solo en canal cifrado (TLS en prod). |

## Bugs / smells detectables por reglas comunes

- **PHP:** consultas SQL en controladores (el proyecto evita esto; acceso vía repositorios).
- **JS:** dependencias incorrectas en `useEffect`, comparaciones laxas, `catch` vacíos (evitados según política del equipo).

## Refactorizaciones relacionadas

Ver [refactorizaciones.md](refactorizaciones.md).

## Conclusión

El repositorio está **preparado** para integrar SonarQube en CI: definir `sonar-project.properties`, excluir `vendor/`, `node_modules/` y `storage/`, y enlazar cobertura cuando PCOV/Xdebug estén disponibles.

# Clean Code y principios SOLID

## Objetivo

Documentar las **convenciones de código** y la aplicación de **SOLID** en el monorepo MiniCine Superstar.

## Descripción

| Principio | Aplicación en el proyecto |
|-----------|---------------------------|
| **S** — Responsabilidad única | Controladores finos; un caso de uso por clase invocable cuando aplica. |
| **O** — Abierto/cerrado | Extensión vía nuevos servicios/repositorios sin modificar contratos existentes de forma incompatible. |
| **L** — Sustitución de Liskov | Modelos Eloquent y colecciones usados de forma consistente en servicios. |
| **I** — Segregación de interfaces | Repositorios pequeños por agregado (reserva, pago, ticket). |
| **D** — Inversión de dependencias | Inyección de servicios y repositorios vía constructor en Laravel. |

## Clean Code — prácticas

- **Nombres descriptivos:** métodos en español de dominio en API (`correo`, `contraseña`) mapeados a columnas inglés en BD (`email`, `password`).
- **Sin lógica de negocio en React crítica:** validación de tickets y precios en servidor.
- **DRY:** reutilización de `ApiFormRequest` para formato 422 unificado.
- **Errores explícitos:** mensajes de negocio en servicios, no genéricos en controlador.

## Conclusión

La arquitectura **Controller → Service → Repository** es el principal vehículo de Clean Architecture **ligera** adecuada al tamaño del producto.

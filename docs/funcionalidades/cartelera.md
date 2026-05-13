# Cartelera

## Objetivo

Permitir al visitante **explorar películas en cartelera**, buscar por título y visualizar el destacado agrupado por categoría, consumiendo la API pública sin autenticación.

## Descripción

La cartelera combina dos modos de consulta expuestos por el mismo recurso de listado:

| Modo | Comportamiento |
|------|----------------|
| Sin parámetros de búsqueda | El servidor devuelve películas agrupadas por categoría (`datos.por_categoria`). |
| Con parámetro `buscar` | El servidor filtra por título y devuelve un arreglo en `datos`. |

El frontend (`CarteleraPage.jsx`) mantiene un campo de búsqueda con **debounce** (300 ms), estados de carga y mensajes de error unificados con el resto de la aplicación.

## Flujo (usuario)

1. El usuario accede a la ruta `/cartelera`.
2. La aplicación solicita `GET /api/v1/peliculas` (sin query o con `?buscar=...`).
3. Se renderizan tarjetas con imagen, título y duración; cada reserva enlaza a `/reserva/:peliculaId`.

## Endpoints

| Método | Ruta | Autenticación |
|--------|------|---------------|
| `GET` | `/api/v1/peliculas` | No |
| `GET` | `/api/v1/peliculas/buscar` | No (validación de query) |

Detalle de parámetros y respuestas: ver [anexos/endpoints_api.md](../anexos/endpoints_api.md).

## Filtros y categorías

- La **categoría** forma parte del modelo de película en base de datos; el listado destacado usa la agregación devuelta por el servicio de dominio.
- El **filtrado por texto** lo realiza el **servidor** (no el navegador), lo que mantiene consistencia con catálogos grandes.

## Responsive

- Rejilla adaptable (`mc-grid-peliculas`) y tipografía fluida alineada al layout global (`Layout.jsx`).
- Documentación ampliada: [responsive.md](responsive.md).

## Consumo API (frontend)

- Función: `getPeliculas(params)` en `frontend/src/api/api.js`.
- Manejo de errores: `mensajeDesdeError` en `frontend/src/utils/erroresApi.js`.

## Pruebas asociadas

- `tests/Feature/Api/V1/Peliculas/PeliculasApiTest.php`

## Conclusión

La cartelera es un módulo **solo lectura** sobre la API v1, desacoplado de autenticación y preparado para auditorías de rendimiento mediante caché HTTP o CDN en capas superiores si el producto lo requiere.

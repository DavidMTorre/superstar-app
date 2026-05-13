# Diseño responsive y experiencia móvil

## Objetivo

Garantizar que la aplicación **React + Vite** sea usable en **teléfonos y tablets** con la misma base de código que en escritorio, priorizando lectura, toques y visualización de tickets QR.

## Descripción

| Área | Prácticas aplicadas |
|------|---------------------|
| **Layout global** | Cabecera flexible (`flex-wrap`), navegación adaptable en `Layout.jsx`. |
| **Formularios** | Paneles `mc-form-panel`, inputs de ancho fluido, botones de ancho completo donde corresponde. |
| **Cartelera y rejillas** | `mc-grid-peliculas` con `minmax` y `auto-fill` para reflow en pantallas estrechas. |
| **Ticket digital** | Imagen QR con `width: min(280px, 72vw)` para no desbordar viewport. |
| **Admin** | Sidebar colapsable en `AdminLayout` (`menuAbierto`, clases `admin-sidebar__collapsible`). |

## Pruebas manuales recomendadas

| Dispositivo / modo | Qué validar |
|---------------------|-------------|
| Chrome DevTools (iPhone / Pixel) | Cartelera, reserva en pasos, pago, ticket. |
| Navegador móvil real | Escaneo QR hacia `/admin/validar-ticket`, permisos de cámara HTTPS. |
| Orientación vertical | Legibilidad de tipografías y CTAs. |

## Conclusión

El responsive se basa en **CSS propio** y componentes reutilizables, sin dependencias pesadas de UI, alineado a mantenibilidad y auditorías de usabilidad (ISO 25010 — adecuación de uso).

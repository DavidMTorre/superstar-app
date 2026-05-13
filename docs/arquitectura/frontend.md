# Frontend — React + Vite

## Objetivo

Describir la organización del **cliente** y la separación entre presentación y datos.

## Estructura principal

| Ruta / carpeta | Contenido |
|----------------|-----------|
| `src/pages/` | Páginas por ruta (cartelera, reserva, pago, perfil, ticket, login…). |
| `src/components/` | Componentes reutilizables (botón, input, alertas, card). |
| `src/api/api.js` | Cliente HTTP centralizado (`fetch`), helpers autenticados. |
| `src/hooks/` | `useSesionUsuario`, `useInvitado`, etc. |
| `src/layout/` | Layout público con navbar. |
| `src/admin/` | Panel administración y páginas anidadas. |

## Enrutamiento

- **React Router** v7 (según `package.json` del frontend).
- Rutas públicas bajo `Layout`; rutas `/admin/*` con guarda de rol.

## Principio UI-only

- **No** se valida definitivamente un ticket en el navegador.
- **No** se genera el QR de negocio en el cliente (imagen proviene del API).
- El escáner **html5-qrcode** solo obtiene texto/URL y lo envía al backend.

## Conclusión

El frontend está preparado para **evolucionar** (PWA, i18n) sin tocar las reglas de negocio del servidor.

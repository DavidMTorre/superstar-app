# Anexo — Comandos e instalación local

## Objetivo

Proporcionar la **secuencia mínima** para levantar backend y frontend en desarrollo.

## Requisitos

| Software | Versión orientativa |
|----------|---------------------|
| PHP | ^8.2 |
| Composer | 2.x |
| Node.js | LTS compatible con Vite 8 |
| MySQL o SQLite | Según `.env` del backend |

## Backend

```bash
cd backend
composer install
cp .env.example .env   # si aplica
php artisan key:generate
php artisan migrate
php artisan serve
```

Variables útiles:

- `FRONTEND_URL` — URL del SPA para enlaces en QR.
- `DB_*` — conexión MySQL o `DB_CONNECTION=sqlite` para pruebas rápidas.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env    # configurar VITE_API_URL si el API no usa proxy
npm run dev
```

## Pruebas

```bash
cd backend
php artisan test
```

## Build producción (frontend)

```bash
cd frontend
npm run build
```

## Conclusión

En despliegue real, servir el **build estático** del frontend detrás de CDN o bucket y el **API** detrás de balanceador con TLS terminado.

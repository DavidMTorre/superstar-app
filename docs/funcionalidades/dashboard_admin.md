# Dashboard y panel de administración

## Objetivo

Ofrecer a usuarios con rol **admin** una consola web para **gestionar el cine**: métricas, catálogos, reservas, usuarios y confitería.

## Descripción

| Recurso API | Uso en panel |
|-------------|--------------|
| `GET /api/v1/admin/dashboard` | Resumen operativo (KPIs agregados). |
| `GET /api/v1/admin/estadisticas` | Series y estadísticas ampliadas. |
| `GET/POST/PUT/DELETE .../admin/peliculas` | CRUD películas. |
| `GET .../admin/reservas` | Listado y filtros de reservas. |
| `GET .../admin/usuarios` + `PUT .../rol` | Usuarios y cambio de rol. |
| Salas y horarios | CRUD bajo `/admin/salas` y subrutas de horarios. |
| Confitería y combos | Rutas bajo `/admin/confiteria` y `/admin/combos`. |

## Autenticación y protección

- **Laravel Sanctum**: token Bearer en cabecera.
- **Middleware `es_admin`**: clase `EnsureUserIsAdmin`; respuesta **403** si el usuario no es administrador.
- Rutas React anidadas bajo `/admin` con componente `RutaAdmin` que comprueba sesión y rol antes de renderizar `AdminLayout`.

## KPIs y gestión

- **Ingresos**, reservas, productos top y ventas por día: expuestos desde servicios de estadísticas y dashboard, serializados para el cliente.
- La UI consume exclusivamente la API; no hay lógica de negocio duplicada en el bundle admin más allá de presentación y validación de formularios de superficie.

## Pruebas asociadas

- `tests/Feature/Api/V1/Admin/AdminDashboardApiTest.php`
- `tests/Feature/Api/V1/Admin/AdminProductoConfiteriaApiTest.php`
- `tests/Feature/Api/V1/Admin/AdminSalasApiTest.php`
- `tests/Feature/Api/V1/Admin/AdminSalaHorarioApiTest.php`
- `tests/Feature/Api/V1/Admin/AdminComboApiTest.php`

## Conclusión

El panel admin es el **punto de control operativo** del sistema y debe desplegarse siempre sobre **HTTPS** con políticas de contraseña y MFA en entornos corporativos (recomendación ISO 27001, fuera del alcance del código base).

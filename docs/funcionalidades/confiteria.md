# Confitería

## Objetivo

Gestionar **productos** y **combos** de confitería asociados a una **reserva pendiente de pago**, con catálogo público y administración restringida a rol administrador.

## Descripción

| Ámbito | Rutas / componentes |
|--------|---------------------|
| **Público** | `GET /api/v1/confiteria/productos`, `GET /api/v1/confiteria/combos` |
| **Carrito / líneas de reserva** | `POST /api/v1/confiteria/agregar` (cuerpo con `codigo_reserva`, `productos`, `combos`) |
| **Admin** | Prefijo `/api/v1/admin/confiteria/productos` y CRUD de combos bajo `/api/v1/admin/combos` |

Los productos se materializan en `reserva_productos` con precio unitario y subtotal al momento de la venta.

## Flujo (cliente)

1. Tras crear una reserva, el usuario puede abrir `/confiteria` en el SPA.
2. Se cargan catálogos públicos.
3. Al confirmar selección, se llama a `agregarProductosConfiteria` → `POST /api/v1/confiteria/agregar`.
4. El total de confitería se suma al flujo de **pago** simulado.

## Flujo (administración)

- Pantallas bajo `/admin/confiteria` y `/admin/combos` (token Sanctum + middleware `es_admin`).
- Operaciones de alta, edición, baja y cambio de estado de productos.

## Integración con reservas

- La reserva debe existir y estar en estado coherente con el negocio (sin pago completado, según reglas del servicio de confitería).
- Los combos se expanden a líneas de producto cuando aplica la lógica del servicio.

## Pruebas asociadas

- `tests/Feature/Api/V1/Confiteria/ConfiteriaApiTest.php`
- Tests de admin de productos: `tests/Feature/Api/V1/Admin/AdminProductoConfiteriaApiTest.php`

## Conclusión

La confitería refuerza el modelo **ticket + consumo** tipo exhibición comercial, manteniendo precios y stock en servidor.

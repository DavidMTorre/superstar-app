# Pruebas — MiniCine Superstar

## 1. Tipos de pruebas

| Tipo | Herramienta | Ubicación | Descripción |
|------|-------------|-----------|-------------|
| **Feature (HTTP / API)** | PHPUnit 11 | `tests/Feature/` | Peticiones JSON a `/api/v1` y aserciones sobre cuerpo y códigos HTTP. |
| **Unit** | PHPUnit | `tests/Unit/` | Ejemplo plantilla (`ExampleTest`); punto de partida para pruebas aisladas. |

Las pruebas de autenticación usan el trait **`RefreshDatabase`** para ejecutar migraciones y resetear el esquema entre tests, garantizando datos predecibles (por ejemplo, `id` de usuario igual a 1 en bases vacías).

## 2. Índice modular de pruebas

| Carpeta / tema | Documento |
|----------------|------------|
| Matriz y enfoque funcional | [pruebas/pruebas_funcionales.md](pruebas/pruebas_funcionales.md) |
| Integración capas | [pruebas/pruebas_integracion.md](pruebas/pruebas_integracion.md) |
| Responsive / móvil | [pruebas/pruebas_responsive.md](pruebas/pruebas_responsive.md) |
| QR y tickets | [pruebas/pruebas_qr.md](pruebas/pruebas_qr.md) |
| Resultados y CI | [pruebas/resultados_pruebas.md](pruebas/resultados_pruebas.md) |

## 3. Casos de prueba implementados (extracto)

### 3.1 `Tests\Feature\Api\V1\HealthTest`

| Test | Comportamiento verificado |
|------|---------------------------|
| `test_health_returns_ok_payload` | GET `/api/v1/health` responde 200, `status` = `ok`, estructura con `timestamp` y `application.name` / `application.environment`. |

### 3.2 `Tests\Feature\Api\V1\Auth\AuthApiTest`

| Test | Comportamiento verificado |
|------|---------------------------|
| `test_registro_exitoso` | POST registro: 201, JSON exacto con usuario público, fila en BD, contraseña verificable con `Hash::check`. |
| `test_registro_correo_duplicado` | 422 y mensaje de correo único. |
| `test_registro_campos_obligatorios` | 422 y presencia de errores por campo obligatorio. |
| `test_registro_formato_correo_y_telefono` | 422 por correo inválido y por teléfono inválido. |
| `test_invitado_genera_guest_id` | 200, `guest_id` presente, prefijo `guest_`, sin nuevos usuarios en BD. |
| `test_login_exitoso` | 200, usuario esperado, ausencia de clave `contraseña` en el JSON del usuario. |
| `test_login_contraseña_incorrecta` | 401 y mensaje de credenciales incorrectas. |
| `test_login_usuario_no_existe` | 401 y mismo mensaje genérico. |
| `test_login_campos_vacios` | 422, errores en `correo` y `contraseña`. |

### 3.3 Otros módulos (referencia)

Además de autenticación y health, el repositorio incluye tests de feature para: **películas**, **reservas**, **disponibilidad**, **confitería**, **pagos**, **accesos**, **perfil**, **tickets**, **admin** (dashboard, salas, horarios, productos, combos). Ver listado en [pruebas/pruebas_funcionales.md](pruebas/pruebas_funcionales.md).

### 3.4 Otras pruebas de plantilla

- `tests/Feature/ExampleTest.php` — respuesta exitosa de una ruta web de ejemplo.
- `tests/Unit/ExampleTest.php` — aserción trivial de ejemplo.

## 4. Resultados de ejecución

Ejecutar desde el directorio `backend/`:

```bash
php artisan test
```

En un entorno donde todas las pruebas pasan, PHPUnit reporta el número total de tests y aserciones en la salida estándar (valores exactos dependen de la versión y del conjunto de tests activos).

## 5. Métricas

### 5.1 M-01 — Cobertura de código

La cobertura requiere una extensión de PHP (**PCOV** o **Xdebug**) habilitada. Sin ella, `php artisan test --coverage` informa que el controlador de cobertura no está disponible.

Ejemplo de comando cuando el entorno está preparado:

```bash
php artisan test --coverage
```

Interpretación: porcentaje de líneas (o ramas, según configuración) del código fuente ejecutadas por la suite. Conviene fijar umbrales en CI cuando se active la cobertura.

### 5.2 M-02 — Tasa de éxito de pruebas

Se define como el cociente entre tests que finalizan en verde y el total ejecutado. Objetivo operativo: **100 %** en la rama principal antes de integración.

Comando recomendado para verificación local y en CI:

```bash
php artisan test
```

Código de salida distinto de cero indica fallo en algún test.

## 6. Buenas prácticas aplicadas

- Pruebas de API orientadas al contrato JSON (`assertExactJson` / `assertJsonPath` donde corresponde).
- Verificación de integridad de contraseña tras registro mediante `Hash::check`, sin exponer el hash en la respuesta.
- Aislamiento de estado con `RefreshDatabase` en flujos que modifican `users`.

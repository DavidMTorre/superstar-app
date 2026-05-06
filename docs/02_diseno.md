# Diseño — MiniCine Superstar

## 1. Arquitectura en capas

El backend sigue un patrón **Controller → Service → Repository → Model**:

| Capa | Ubicación típica | Responsabilidad |
|------|------------------|-----------------|
| **Controller** | `app/Http/Controllers/Api/V1/` | Recibir la petición HTTP, validación delegada al Form Request, invocar el servicio y formatear la respuesta JSON (códigos HTTP). |
| **Form Request** | `app/Http/Requests/Api/V1/` | Reglas de validación y mensajes en español; las peticiones de API que extienden `ApiFormRequest` unifican errores 422. |
| **Service** | `app/Services/` | Lógica de negocio y orquestación (p. ej. registro, login, invitado, payload de health). |
| **Repository** | `app/Repositories/` | Acceso a datos: consultas Eloquent o lectura de configuración; sin reglas de negocio complejas. |
| **Model** | `app/Models/` | Mapeo ORM, `fillable`, `hidden`, `casts` (p. ej. contraseña hasheada). |

Los controladores de autenticación son **invocables** (`__invoke`), lo que mantiene un endpoint por clase y alinea con las rutas definidas como `Controller::class`.

## 2. Diseño de API REST

### 2.1 Prefijo y versionado

- Laravel registra el archivo `routes/api.php` con prefijo global **`api`** (configuración por defecto del framework).
- Dentro del archivo, las rutas se agrupan con `Route::prefix('v1')`, de modo que las URLs efectivas son **`/api/v1/...`**.

### 2.2 Endpoints implementados

| Método | Ruta | Nombre de ruta | Descripción |
|--------|------|----------------|-------------|
| GET | `/api/v1/health` | `api.v1.health` | Estado del servicio y metadatos de aplicación. |
| POST | `/api/v1/auth/registro` | `api.v1.auth.registro` | Alta de usuario. |
| POST | `/api/v1/auth/login` | `api.v1.auth.login` | Inicio de sesión. |
| POST | `/api/v1/auth/invitado` | `api.v1.auth.invitado` | Identificador de invitado. |

### 2.3 Convención de respuestas JSON

- **Éxito (autenticación):** `exito: true`, `datos` con carga útil, `mensaje` descriptivo.
- **Registro:** código HTTP **201 Created**.
- **Login exitoso:** código HTTP **200 OK**.
- **Invitado y health:** **200 OK**.
- **Validación fallida:** **422 Unprocessable Entity** con `exito: false`, `mensaje: "Error de validación"` y `errores` (objeto de errores de Laravel).
- **Credenciales incorrectas (login):** **401 Unauthorized** con `exito: false` y mensaje genérico (sin distinguir usuario inexistente de contraseña errónea).

### 2.4 Health check

No usa `ApiFormRequest` con validación de campos; `HealthCheckRequest` prepara el punto de extensión para parámetros futuros. El **HealthController** devuelve directamente el array del **HealthService** (estructura: `status`, `timestamp`, `application.name`, `application.environment`).

## 3. Decisiones técnicas

- **Laravel 12** (según `composer.json`) y **PHP ^8.2**.
- **MySQL** como motor relacional; tabla `users` ampliada con `telefono`, `fecha_nacimiento`, `genero` además de los campos estándar.
- **Nombres de campos en API en español** donde aplica (`correo`, `contraseña`, `nombre`) mientras el modelo usa convenciones Laravel (`email`, `password`, `name`) — el servicio realiza el mapeo.
- **Sin tokens OAuth/Sanctum** en el código actual: el login confirma credenciales y devuelve el objeto usuario público; una capa de tokens puede añadirse después sin romper el contrato de capas.
- **Modo invitado:** identificador `guest_<uuid sin guiones>` generado en memoria; no se persiste en base de datos en el flujo actual.
- **Pruebas:** `RefreshDatabase` en pruebas de autenticación para aislar estado entre tests.

## 4. Dependencias del cliente

El frontend (`frontend/package.json`) usa **React 19** y **Vite 8**; las llamadas a la API deben usar `Content-Type: application/json` y la base URL del servidor Laravel configurada en el entorno del cliente.

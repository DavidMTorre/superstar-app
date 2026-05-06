# Implementación — MiniCine Superstar

## 1. Estructura del backend

Árbol conceptual relevante (no exhaustivo):

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/V1/
│   │   │       ├── HealthController.php
│   │   │       └── Auth/
│   │   │           ├── RegistroController.php
│   │   │           ├── LoginController.php
│   │   │           └── InvitadoController.php
│   │   └── Requests/
│   │       └── Api/
│   │           ├── ApiFormRequest.php
│   │           └── V1/
│   │               ├── HealthCheckRequest.php
│   │               └── Auth/
│   │                   ├── RegistroRequest.php
│   │                   ├── LoginRequest.php
│   │                   └── InvitadoRequest.php
│   ├── Models/
│   │   └── User.php
│   ├── Repositories/
│   │   ├── HealthRepository.php
│   │   └── UserRepository.php
│   └── Services/
│       ├── HealthService.php
│       └── AuthService.php
├── routes/
│   └── api.php
├── database/
│   └── migrations/
└── tests/
    └── Feature/Api/V1/
        ├── HealthTest.php
        └── Auth/AuthApiTest.php
```

## 2. Uso de Laravel

### 2.1 Enrutamiento

`bootstrap/app.php` registra `routes/api.php` como rutas API. El grupo `v1` y el subgrupo `auth` concentran los endpoints REST documentados en `routes/api.php`.

### 2.2 Validación

- **`ApiFormRequest`:** Sobrescribe `failedValidation` para devolver JSON 422 con `exito`, `mensaje` y `errores`.
- **Auth:** `RegistroRequest`, `LoginRequest` e `InvitadoRequest` extienden `ApiFormRequest` (excepto el health, que usa `FormRequest` base).

### 2.3 Modelo `User`

- Extiende `Authenticatable`.
- `password` con cast `hashed` y en `$hidden` para no exponerlo en serialización.
- Campos de perfil: `telefono`, `fecha_nacimiento` (cast a fecha), `genero`.

### 2.4 Servicios

- **`AuthService`:** `registrarUsuario`, `iniciarSesion` (Hash::check), `crearSesionInvitado`; método privado `usuarioPublico` para la forma de salida del usuario.
- **`HealthService`:** Ensambla `status`, `timestamp` ISO8601 y metadatos desde `HealthRepository`.

### 2.5 Repositorios

- **`UserRepository`:** `create` para registro; `findByEmail` para login.
- **`HealthRepository`:** Lee `config('app.name')` y `config('app.env')`.

## 3. Cómo se implementaron las funcionalidades

| Funcionalidad | Controlador | Form Request | Service | Repository |
|---------------|-------------|--------------|---------|------------|
| Health | `HealthController` | `HealthCheckRequest` | `HealthService` | `HealthRepository` |
| Registro | `RegistroController` | `RegistroRequest` | `AuthService::registrarUsuario` | `UserRepository::create` |
| Login | `LoginController` | `LoginRequest` | `AuthService::iniciarSesion` | `UserRepository::findByEmail` |
| Invitado | `InvitadoController` | `InvitadoRequest` | `AuthService::crearSesionInvitado` | — |

## 4. Base de datos

La migración por defecto de Laravel para `users` incluye además tablas `password_reset_tokens` y `sessions`. Los campos específicos del dominio están en la definición de `users` (nombre, email único, contraseña, teléfono, fecha de nacimiento, género).

## 5. Frontend (referencia)

El proyecto incluye una aplicación **React + Vite** bajo `frontend/`. La consumición de la API se realiza mediante peticiones HTTP al backend; la configuración de URL base y almacenamiento de sesión en cliente queda fuera del alcance de los archivos backend citados aquí.

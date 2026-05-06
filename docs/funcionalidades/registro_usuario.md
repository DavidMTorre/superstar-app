# Registro de usuario

## Descripción

Permite crear una cuenta en el sistema persistiendo un registro en la tabla `users` con datos de perfil. La contraseña se almacena de forma segura mediante el cast `hashed` del modelo `User`. La respuesta incluye una vista **pública** del usuario (sin contraseña ni tokens).

## Endpoint

| Elemento | Valor |
|----------|-------|
| **Método** | `POST` |
| **URL** | `/api/v1/auth/registro` |
| **Nombre de ruta** | `api.v1.auth.registro` |
| **Controlador** | `App\Http\Controllers\Api\V1\Auth\RegistroController` (invocable) |
| **HTTP éxito** | `201 Created` |

## Datos de entrada

Cuerpo JSON (campo `Content-Type: application/json`):

| Campo | Tipo | Observaciones |
|-------|------|---------------|
| `nombre` | string | Obligatorio, máximo 255 caracteres. |
| `correo` | string | Obligatorio, formato email, único en `users.email`. |
| `contraseña` | string | Obligatorio, mínimo 6 caracteres. |
| `telefono` | string | Obligatorio, regex `^\+?[0-9]{9,15}$`. |
| `fecha_nacimiento` | string (fecha) | Obligatorio, fecha válida, anterior a hoy y posterior a `1900-01-01`. |
| `genero` | string | Obligatorio, máximo 50 caracteres. |

## Validaciones

Definidas en `App\Http\Requests\Api\V1\Auth\RegistroRequest`:

- Reglas indicadas en la tabla anterior.
- Mensajes personalizados en español (correo único, formato de teléfono, etc.).
- Fallos de validación: respuesta **422** mediante `ApiFormRequest` con `exito: false`, `mensaje: "Error de validación"` y objeto `errores`.

## Lógica (Service)

Clase: `App\Services\AuthService`

- Método: `registrarUsuario(array $datos)`
- Mapeo de entrada API → columnas del modelo: `nombre` → `name`, `correo` → `email`, `contraseña` → `password`, resto homónimo salvo convenciones del modelo.
- Tras crear el usuario vía repositorio, construye el array de salida con `usuarioPublico($user)`:
  - `id`, `nombre`, `correo`, `telefono`, `fecha_nacimiento` (formato `Y-m-d`), `genero`.

## Acceso a datos (Repository)

Clase: `App\Repositories\UserRepository`

- Método: `create(array $attributes): User`
- Implementación: `User::query()->create($attributes)` — el modelo aplica hashing en `password` al persistir.

## Ejemplo de petición

```http
POST /api/v1/auth/registro HTTP/1.1
Host: localhost
Content-Type: application/json

{
  "nombre": "María Pérez",
  "correo": "maria@example.com",
  "contraseña": "secreto6",
  "telefono": "987654321",
  "fecha_nacimiento": "2001-06-15",
  "genero": "femenino"
}
```

## Ejemplo de respuesta (éxito)

HTTP `201 Created`:

```json
{
  "exito": true,
  "datos": {
    "usuario": {
      "id": 1,
      "nombre": "María Pérez",
      "correo": "maria@example.com",
      "telefono": "987654321",
      "fecha_nacimiento": "2001-06-15",
      "genero": "femenino"
    }
  },
  "mensaje": "Usuario registrado correctamente"
}
```

## Ejemplo de respuesta (validación)

HTTP `422`:

```json
{
  "exito": false,
  "mensaje": "Error de validación",
  "errores": {
    "correo": ["El correo ya está registrado."]
  }
}
```

## Pruebas asociadas

Archivo: `tests/Feature/Api/V1/Auth/AuthApiTest.php`

- `test_registro_exitoso`
- `test_registro_correo_duplicado`
- `test_registro_campos_obligatorios`
- `test_registro_formato_correo_y_telefono`

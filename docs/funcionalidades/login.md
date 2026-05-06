# Login

## Descripción

Permite a un usuario **ya registrado** autenticarse enviando correo y contraseña. Se busca el usuario por correo electrónico y se verifica la contraseña con `Hash::check` contra el valor almacenado (hash). Si el correo no existe o la contraseña no coincide, se devuelve el mismo mensaje de error (**401**) para no revelar cuál de los dos falló.

## Endpoint

| Elemento | Valor |
|----------|-------|
| **Método** | `POST` |
| **URL** | `/api/v1/auth/login` |
| **Nombre de ruta** | `api.v1.auth.login` |
| **Controlador** | `App\Http\Controllers\Api\V1\Auth\LoginController` (invocable) |
| **HTTP éxito** | `200 OK` |
| **HTTP credenciales inválidas** | `401 Unauthorized` |

## Datos de entrada

| Campo | Tipo | Observaciones |
|-------|------|---------------|
| `correo` | string | Obligatorio, formato email. |
| `contraseña` | string | Obligatorio. |

## Validaciones

Definidas en `App\Http\Requests\Api\V1\Auth\LoginRequest`:

- `correo`: `required`, `string`, `email`
- `contraseña`: `required`, `string`
- Mensajes en español para campos obligatorios y formato de correo.
- Fallos de validación: **422** con el formato estándar de `ApiFormRequest`.

## Lógica (Service)

Clase: `App\Services\AuthService`

- Método: `iniciarSesion(array $datos): ?array`
- Pasos:
  1. Obtener `User` mediante `UserRepository::findByEmail($datos['correo'])`.
  2. Si no hay usuario, devolver `null`.
  3. Si `Hash::check($datos['contraseña'], $user->password)` es falso, devolver `null`.
  4. En caso contrario, devolver `['usuario' => usuarioPublico($user)]` — misma forma que en registro (sin contraseña).

## Acceso a datos (Repository)

Clase: `App\Repositories\UserRepository`

- Método: `findByEmail(string $email): ?User`
- Implementación: consulta `User::query()->where('email', $email)->first()`.

## Ejemplo de petición

```http
POST /api/v1/auth/login HTTP/1.1
Host: localhost
Content-Type: application/json

{
  "correo": "ana@example.com",
  "contraseña": "claveSegura1"
}
```

## Ejemplo de respuesta (éxito)

HTTP `200 OK`:

```json
{
  "exito": true,
  "datos": {
    "usuario": {
      "id": 1,
      "nombre": "Ana López",
      "correo": "ana@example.com",
      "telefono": "612345678",
      "fecha_nacimiento": "1995-03-20",
      "genero": "femenino"
    }
  },
  "mensaje": "Inicio de sesión exitoso"
}
```

Los valores del usuario dependen del registro existente en base de datos.

## Ejemplo de respuesta (credenciales incorrectas)

HTTP `401 Unauthorized` (usuario inexistente o contraseña errónea):

```json
{
  "exito": false,
  "mensaje": "Credenciales incorrectas"
}
```

No se incluye el campo `datos`.

## Ejemplo de respuesta (validación)

HTTP `422` — por ejemplo cuerpo vacío:

```json
{
  "exito": false,
  "mensaje": "Error de validación",
  "errores": {
    "correo": ["El correo es obligatorio."],
    "contraseña": ["La contraseña es obligatoria."]
  }
}
```

## Pruebas asociadas

Archivo: `tests/Feature/Api/V1/Auth/AuthApiTest.php`

- `test_login_exitoso`
- `test_login_contraseña_incorrecta`
- `test_login_usuario_no_existe`
- `test_login_campos_vacios`

# Usuario invitado

## Descripción

Genera un identificador de sesión para un **usuario no registrado**, sin crear filas en la tabla `users`. El cliente puede almacenar el valor devuelto (`guest_id`) para marcar acciones posteriores como anónimas o de invitado. El identificador se construye en memoria a partir de un UUID.

## Endpoint

| Elemento | Valor |
|----------|-------|
| **Método** | `POST` |
| **URL** | `/api/v1/auth/invitado` |
| **Nombre de ruta** | `api.v1.auth.invitado` |
| **Controlador** | `App\Http\Controllers\Api\V1\Auth\InvitadoController` (invocable) |
| **HTTP éxito** | `200 OK` |

## Datos de entrada

El cuerpo puede enviarse vacío (`{}`). No hay campos obligatorios en la versión actual.

## Validaciones

Clase: `App\Http\Requests\Api\V1\Auth\InvitadoRequest`

- Reglas vacías (`rules()` devuelve array vacío).
- Sigue extendiendo `ApiFormRequest` para mantener consistencia con el resto de endpoints de autenticación.

## Lógica (Service)

Clase: `App\Services\AuthService`

- Método: `crearSesionInvitado(): array`
- Retorna un array con una clave:
  - `guest_id`: prefijo `guest_` concatenado con un UUID en minúsculas del cual se eliminan los guiones (`Str::uuid()`, normalización con `Str::replace` y `Str::lower`).

No interviene el repositorio de usuarios ni persistencia adicional en este flujo.

## Acceso a datos (Repository)

No aplica acceso a base de datos para la generación del `guest_id`. El modelo `User` no se modifica.

## Ejemplo de petición

```http
POST /api/v1/auth/invitado HTTP/1.1
Host: localhost
Content-Type: application/json

{}
```

## Ejemplo de respuesta (éxito)

HTTP `200 OK`:

```json
{
  "exito": true,
  "datos": {
    "guest_id": "guest_a1b2c3d4e5f6789012345678abcdef01"
  },
  "mensaje": "Sesión de invitado iniciada"
}
```

El valor exacto de `guest_id` cambia en cada llamada.

## Pruebas asociadas

Archivo: `tests/Feature/Api/V1/Auth/AuthApiTest.php`

- `test_invitado_genera_guest_id` — comprueba estructura, prefijo `guest_`, tipo string y que el conteo de usuarios en BD no aumenta.

# Análisis — MiniCine Superstar

## 1. Contexto del problema

Las aplicaciones de entretenimiento digital necesitan identificar a los usuarios para personalizar la experiencia, reservar o recomendar contenido, y al mismo tiempo permitir el uso sin cuenta mediante un modo reducido (invitado). El sistema **MiniCine Superstar** aborda ese escenario sobre una API REST consumible por un cliente web construido con **React (Vite)** y datos persistentes en **MySQL**.

El backend debe exponer operaciones claras de alta de usuario, acceso con credenciales y opción de sesión no registrada, manteniendo validaciones coherentes y respuestas JSON uniformes para el frontend.

## 2. Objetivos del sistema

- Ofrecer una **API REST versionada** bajo el prefijo `/api/v1` con comprobación de disponibilidad (**health check**).
- Permitir el **registro** de usuarios con datos de perfil y almacenamiento seguro de contraseña.
- Posibilitar el **inicio de sesión** de usuarios ya registrados mediante correo y contraseña.
- Habilitar una **sesión de invitado** mediante un identificador generado en servidor, sin persistir filas de usuario para ese flujo.
- Facilitar **evolución y mantenimiento** mediante arquitectura en capas y pruebas automatizadas.

## 3. Justificación

- **Separación de responsabilidades:** Los controladores delegan en servicios; la persistencia se concentra en repositorios y modelos Eloquent, lo que reduce el acoplamiento y simplifica cambios en reglas de negocio o en el esquema de datos.
- **Contrato API estable:** Respuestas con campos `exito`, `datos` y `mensaje` (y `errores` en validación) permiten al cliente React manejar estados de forma predecible.
- **Seguridad básica:** Contraseñas hasheadas en el modelo de usuario (`casts`) y verificación con `Hash::check` en login; la respuesta de usuario nunca incluye la contraseña.
- **Calidad:** Pruebas de feature con PHPUnit validan los flujos críticos de autenticación y el endpoint de salud, alineado con métricas de éxito de pruebas y capacidad de medir cobertura cuando el entorno dispone de Xdebug o PCOV.

## 4. Alcance documentado

Este análisis se centra en el backend Laravel tal como está implementado en el repositorio: rutas en `routes/api.php`, capas bajo `app/`, migraciones y pruebas en `tests/`. El frontend React se describe a nivel de stack; su integración detallada puede ampliarse en iteraciones posteriores del proyecto.

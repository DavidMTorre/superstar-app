# Pruebas responsive y móviles

## Objetivo

Definir cómo validar la **experiencia en dispositivos móviles** y viewports reducidos, complementando la automatización backend.

## Descripción

| ID | Módulo | Descripción | Entrada | Resultado esperado |
|----|--------|-------------|---------|-------------------|
| R-01 | Layout | Cabecera en pantalla &lt; 400px | Reducir ancho | Menú y enlaces accesibles sin solapamiento crítico. |
| R-02 | Cartelera | Rejilla de posters | Ancho móvil | Tarjetas en una o dos columnas fluidas. |
| R-03 | Reserva | Formulario de reserva | Scroll vertical | Campos alcanzables y botón envío visible. |
| R-04 | Pago / ticket | QR visual | Móvil real | QR legible a distancia típica de torniquete. |
| R-05 | Admin validar QR | Cámara | HTTPS local o tunnel | Permiso de cámara concedido; lectura de URL del QR. |

## Resultado obtenido

Las pruebas R-01 a R-04 se ejecutan como **manuales** o con **DevTools**; R-05 requiere dispositivo físico y entorno con cámara permitida.

## Conclusión

Para auditorías ISO de usabilidad conviene anexar **evidencias** (capturas) en [anexos/capturas.md](../anexos/capturas.md).

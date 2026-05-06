/** Extrae mensaje legible de errores fetch / Laravel */
export function mensajeDesdeError(error) {
  const cuerpo = error?.cuerpo
  if (!cuerpo) return error?.message || 'Error desconocido.'
  if (typeof cuerpo.mensaje === 'string') return cuerpo.mensaje
  if (cuerpo.errores && typeof cuerpo.errores === 'object') {
    const primero = Object.values(cuerpo.errores)[0]
    if (Array.isArray(primero) && primero[0]) return primero[0]
  }
  return error.message || 'Error desconocido.'
}

/**
 * Mapa campo → primer mensaje (validación Laravel en `errores`).
 * @returns {Record<string, string>}
 */
export function mapaErroresValidacion(error) {
  const cuerpo = error?.cuerpo
  if (!cuerpo?.errores || typeof cuerpo.errores !== 'object') return {}
  /** @type {Record<string, string>} */
  const salida = {}
  for (const [clave, mensajes] of Object.entries(cuerpo.errores)) {
    if (Array.isArray(mensajes) && typeof mensajes[0] === 'string') {
      salida[clave] = mensajes[0]
    }
  }
  return salida
}

/**
 * Normaliza token QR desde ruta, URL escaneada o texto plano.
 * Compartido entre vista de ticket y validación admin.
 */
export function extraerTokenDesdeTextoEscaneado(texto) {
  const limpio = String(texto ?? '').trim()
  if (!limpio) return ''

  try {
    const u = new URL(limpio)
    const segmentos = u.pathname.split('/').filter(Boolean)
    const iTicket = segmentos.indexOf('ticket')
    if (iTicket >= 0 && segmentos[iTicket + 1]) {
      return decodeURIComponent(segmentos[iTicket + 1])
    }
  } catch {
    /* URL relativa o token plano */
  }

  const porSlash = limpio.split('/').filter(Boolean)
  const idx = porSlash.indexOf('ticket')
  if (idx >= 0 && porSlash[idx + 1]) {
    return decodeURIComponent(porSlash[idx + 1])
  }

  return limpio
}

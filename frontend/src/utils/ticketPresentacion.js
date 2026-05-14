/** Fecha larga para encabezado de ticket (es-PE). */
export function formatFechaTicketLarga(fecha) {
  if (!fecha) return ''
  try {
    const d = new Date(`${fecha}T12:00:00`)
    return d.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return fecha
  }
}

/** Etiqueta mayúsculas para badge de estado. */
export function etiquetaEstadoTicket(estado) {
  if (estado === 'utilizado') return 'UTILIZADO'
  if (estado === 'expirado') return 'EXPIRADO'
  if (estado === 'vigente') return 'VIGENTE'
  return estado ? String(estado).toUpperCase() : ''
}

/** Clases Tailwind del badge según estado (misma apariencia que antes). */
export function clasesBadgeEstadoTicket(estado) {
  if (estado === 'utilizado') {
    return 'bg-[rgba(161,161,170,0.2)] text-[var(--color-text-light)]'
  }
  if (estado === 'expirado') {
    return 'bg-[rgba(234,84,85,0.15)] text-[var(--color-error)]'
  }
  return 'bg-[rgba(255,122,0,0.18)] text-[var(--color-primary-light)]'
}

/** Lista confitería segura para render. */
export function listaConfiteriaTicket(ticket) {
  return Array.isArray(ticket?.confiteria) ? ticket.confiteria : []
}

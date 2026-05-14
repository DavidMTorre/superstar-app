/** Busca película en cartelera por id (misma lógica que antes). */
export function peliculaDesdeCartelera(porCategoria, peliculaId) {
  const n = Number(peliculaId)
  if (!porCategoria || Number.isNaN(n)) return null
  for (const lista of Object.values(porCategoria)) {
    const p = lista.find((x) => x.id === n)
    if (p) return p
  }
  return null
}

export function fechaMinimaHoy() {
  const d = new Date()
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${da}`
}

export function fechaLegibleYmd(ymd) {
  if (!ymd || typeof ymd !== 'string') return ''
  try {
    const d = new Date(`${ymd}T12:00:00`)
    if (Number.isNaN(d.getTime())) return ymd
    return d.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ymd
  }
}

export function claveSlotHorario(item) {
  return `${item.sala_id}:${item.hora_inicio}`
}

export function mismoHorarioSeleccion(a, b) {
  if (!a || !b) return false
  return claveSlotHorario(a) === claveSlotHorario(b)
}

export function horariosOrdenadosPorSala(disponibilidad, salaId) {
  return disponibilidad
    .filter((d) => d.sala_id === salaId)
    .sort((a, b) => String(a.hora_inicio).localeCompare(String(b.hora_inicio)))
}

export function horaInicioParaApiReserva(hora) {
  const s = String(hora).trim()
  if (s.length === 5 && s.includes(':')) return `${s}:00`
  return s
}

/** Primer precio por sala_id desde filas de disponibilidad. */
export function mapaPrecioPorSala(disponibilidad) {
  const m = new Map()
  for (const row of disponibilidad) {
    if (row?.sala_id != null && !m.has(row.sala_id)) {
      m.set(row.sala_id, Number(row.precio))
    }
  }
  return m
}

export function mapaConteoPorSala(disponibilidad) {
  const m = new Map()
  for (const d of disponibilidad) {
    m.set(d.sala_id, (m.get(d.sala_id) ?? 0) + 1)
  }
  return m
}

export function pasoReservaActual(fecha, salaSeleccionada, horarioSeleccionado) {
  if (horarioSeleccionado) return 3
  if (salaSeleccionada) return 2
  if (fecha) return 1
  return 0
}

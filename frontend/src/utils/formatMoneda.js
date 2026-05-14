/** Formato soles es-PE (reutilizable admin y reportes). */
export function formatSolesPe(n) {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

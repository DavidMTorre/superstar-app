import { memo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

function claseSala(activa) {
  if (activa) {
    return 'border-[rgba(255,122,0,0.65)] bg-[rgba(255,122,0,0.14)] shadow-[0_0_36px_rgba(255,122,0,0.22)]'
  }
  return 'border-[var(--color-border-subtle)] bg-[rgba(27,27,37,0.55)] shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:border-[rgba(255,122,0,0.45)] hover:shadow-[0_0_28px_rgba(255,122,0,0.12)]'
}

export const ReservaTarjetaSala = memo(function ReservaTarjetaSala({
  sala,
  activa,
  numFunciones,
  precioDesde,
  onSeleccionar,
}) {
  const etiquetaFunciones = numFunciones === 1 ? 'función' : 'funciones'
  const precioValido = precioDesde != null && !Number.isNaN(precioDesde)

  return (
    <motion.button
      type="button"
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        claseSala(activa),
      )}
      onClick={() => onSeleccionar(sala)}
      aria-pressed={activa}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-gold)]">
        Sala Superstar
      </span>
      <span className="text-lg font-bold leading-tight text-[var(--color-text)]">{sala.sala}</span>
      <span className="text-xs text-[var(--color-text-muted)]">Butacas numeradas · sonido envolvente</span>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--color-border-subtle)] pt-2 text-xs text-[var(--color-text-light)]">
        <span>
          {numFunciones} {etiquetaFunciones} ese día
        </span>
        {precioValido ? (
          <span className="font-bold text-[var(--color-primary-light)]">
            Desde S/ {precioDesde.toFixed(2)}
          </span>
        ) : null}
      </div>
    </motion.button>
  )
})

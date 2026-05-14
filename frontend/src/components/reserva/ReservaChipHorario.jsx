import { memo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

function claseHorario(activo) {
  if (activo) {
    return 'border-[rgba(255,122,0,0.75)] bg-[rgba(255,122,0,0.18)] shadow-[0_0_28px_rgba(255,122,0,0.25)]'
  }
  return 'border-[var(--color-border-subtle)] bg-[rgba(27,27,37,0.6)] hover:border-[rgba(255,122,0,0.4)] hover:shadow-[0_0_20px_rgba(255,122,0,0.1)]'
}

export const ReservaChipHorario = memo(function ReservaChipHorario({ slot, activo, onSeleccionar }) {
  return (
    <motion.button
      type="button"
      layout
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'min-w-[8.5rem] flex-1 rounded-2xl border px-4 py-3 text-center transition-shadow sm:min-w-[9.5rem] sm:flex-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        claseHorario(activo),
      )}
      onClick={() => onSeleccionar(slot)}
      aria-pressed={activo}
    >
      <span className="block text-sm font-bold text-[var(--color-text)]">
        {slot.hora_inicio} – {slot.hora_fin}
      </span>
      <span className="mt-1 block text-xs font-extrabold text-[var(--color-primary-light)]">
        S/ {Number(slot.precio).toFixed(2)}
      </span>
    </motion.button>
  )
})

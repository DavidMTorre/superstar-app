import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

const PASOS = [
  { n: 1, label: 'Fecha', claveOk: 'fecha' },
  { n: 2, label: 'Sala', claveOk: 'sala' },
  { n: 3, label: 'Horario', claveOk: 'horario' },
]

function clasePaso({ pasoActual, ok, n }) {
  if (pasoActual === n) {
    return 'border-[rgba(255,122,0,0.55)] bg-[rgba(255,122,0,0.15)] text-[var(--color-primary-light)] shadow-[0_0_20px_rgba(255,122,0,0.12)]'
  }
  if (ok) {
    return 'border-[rgba(40,199,111,0.35)] bg-[rgba(40,199,111,0.08)] text-[var(--color-success)]'
  }
  return 'border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.03)] text-[var(--color-text-muted)]'
}

/** Indicador de pasos fecha → sala → horario. */
export function ReservaProgresoPasos({ pasoActual, tieneFecha, tieneSala, tieneHorario }) {
  const okPorClave = { fecha: tieneFecha, sala: tieneSala, horario: tieneHorario }

  return (
    <nav className="mb-8 flex flex-wrap gap-2" aria-label="Progreso de reserva">
      {PASOS.map((s) => {
        const ok = okPorClave[s.claveOk]
        return (
          <div
            key={s.n}
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              clasePaso({ pasoActual, ok, n: s.n }),
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[10px]',
                ok ? 'bg-[rgba(40,199,111,0.25)] text-[var(--color-success)]' : 'bg-[rgba(255,255,255,0.08)]',
              )}
            >
              {ok ? <Check className="h-3 w-3" aria-hidden /> : s.n}
            </span>
            {s.label}
          </div>
        )
      })}
    </nav>
  )
}

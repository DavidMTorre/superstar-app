import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const TRANS_PANEL = { duration: 0.45, ease: [0.22, 1, 0.36, 1] }

/** Cabecera glass con póster y título (animación motion conservada). */
export function ReservaCabeceraPanel({ backdropUrl, tituloPelicula, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={TRANS_PANEL}
      className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(11,11,15,0.45)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl md:p-7"
    >
      <div className="mb-6 flex flex-wrap items-start gap-4 border-b border-[var(--color-border-subtle)] pb-6">
        <div className="relative h-28 w-[4.5rem] shrink-0 overflow-hidden rounded-xl ring-2 ring-[rgba(255,122,0,0.35)] shadow-[0_0_24px_rgba(255,122,0,0.15)]">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt=""
              className="h-full w-full object-cover"
              decoding="async"
              loading="eager"
            />
          ) : (
            <div className="mc-placeholder-img flex h-full w-full items-center justify-center text-[0.65rem]">
              {tituloPelicula}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-accent-gold)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Reserva inmersiva
          </p>
          <h1 className="mb-1 text-2xl font-extrabold leading-tight tracking-tight text-[var(--color-text)] md:text-3xl">
            {tituloPelicula}
          </h1>
          <p className="mb-0 text-sm text-[var(--color-text-muted)]">
            Elige fecha, sala y horario. Tu selección se resalta con la identidad Superstar.
          </p>
        </div>
      </div>
      {children}
    </motion.div>
  )
}

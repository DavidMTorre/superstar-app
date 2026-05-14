import { AnimatePresence, motion } from 'framer-motion'

/** Fondo inmersivo cartelera (sin cambiar clases ni animación). */
export function ReservaBackdrop({ backdropUrl }) {
  return (
    <div className="pointer-events-none absolute inset-0 min-h-[100dvh]" aria-hidden>
      <AnimatePresence mode="wait">
        {backdropUrl ? (
          <motion.div
            key={backdropUrl}
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img
              src={backdropUrl}
              alt=""
              className="h-full min-h-[100dvh] w-full scale-105 object-cover object-[center_22%]"
              decoding="async"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-[var(--color-background)]/82 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0f]/95 via-[#0b0b0f]/78 to-[#0b0b0f]/94" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0f]/95 via-transparent to-[#0b0b0f]/88" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(255,122,0,0.12),transparent_55%)]" />
          </motion.div>
        ) : (
          <motion.div
            key="reserva-fondo-sin-poster"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 min-h-[100dvh] bg-gradient-to-br from-[rgba(255,122,0,0.18)] via-[var(--color-surface)] to-[var(--color-background)]"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

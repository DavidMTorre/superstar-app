import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Play, Sparkles } from 'lucide-react'

/** Hero destacado cartelera (mismas clases y animación). */
export function CarteleraHero({ pelicula }) {
  if (!pelicula) return null

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative -mx-4 mb-10 min-h-[min(72vh,520px)] overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] md:-mx-6 lg:-mx-8"
    >
      {pelicula.imagen_url ? (
        <>
          <img
            src={pelicula.imagen_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[rgba(11,11,15,0.88)] to-[rgba(11,11,15,0.45)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)]/90 via-transparent to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,122,0,0.25)] via-[var(--color-surface)] to-[var(--color-background)]" />
      )}
      <div className="relative z-10 flex min-h-[min(72vh,520px)] flex-col justify-end p-6 pb-10 md:p-10 md:pb-12">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-gold)]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Destacado
        </p>
        <h1 className="mb-2 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[var(--color-text)] md:text-5xl">
          {pelicula.titulo || 'Cartelera'}
        </h1>
        <p className="mb-6 max-w-lg text-sm text-[var(--color-text-light)] md:text-base">
          Reserva tu función con experiencia premium. Elige sala, horario y disfruta en MiniCine Superstar.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/reserva/${pelicula.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_32px_var(--color-primary-glow)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="h-4 w-4 fill-current" aria-hidden />
            Reservar ahora
          </Link>
          <a
            href="#catalogo"
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.06)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] backdrop-blur-sm transition-colors hover:border-[rgba(255,122,0,0.45)] hover:text-[var(--color-primary-light)]"
          >
            Explorar catálogo
            <ChevronRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </motion.section>
  )
}

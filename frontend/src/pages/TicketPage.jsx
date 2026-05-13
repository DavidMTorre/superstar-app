import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Ticket as TicketIcon } from 'lucide-react'
import { getTicket } from '../api/api'
import { Cargando } from '../components/Cargando'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { mensajeDesdeError } from '../utils/erroresApi'

function extraerTokenDesdeTextoEscaneado(texto) {
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

export default function TicketPage() {
  const { token: tokenParam } = useParams()
  const tokenRuta = extraerTokenDesdeTextoEscaneado(tokenParam)

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ticket, setTicket] = useState(null)

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      setCargando(true)
      setError('')
      setTicket(null)

      if (!tokenRuta) {
        setError('Enlace de ticket no válido.')
        setCargando(false)
        return
      }

      try {
        const resp = await getTicket(tokenRuta)
        if (cancelado) return

        if (!resp?.exito || !resp?.datos) {
          setError(resp?.mensaje || 'No se pudo cargar el ticket.')
          return
        }

        setTicket(resp.datos)
      } catch (err) {
        if (!cancelado) {
          setError(mensajeDesdeError(err))
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    void cargar()

    return () => {
      cancelado = true
    }
  }, [tokenRuta])

  const fechaTitulo = useMemo(() => {
    if (!ticket?.fecha) return ''
    try {
      const d = new Date(`${ticket.fecha}T12:00:00`)
      return d.toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return ticket.fecha
    }
  }, [ticket])

  const estadoEtiqueta = useMemo(() => {
    const e = ticket?.estado
    if (e === 'utilizado') return 'UTILIZADO'
    if (e === 'expirado') return 'EXPIRADO'
    if (e === 'vigente') return 'VIGENTE'
    return e ? String(e).toUpperCase() : ''
  }, [ticket])

  if (cargando) {
    return <Cargando mensaje="Cargando tu entrada…" />
  }

  if (error || !ticket) {
    return (
      <div className="mx-auto max-w-md pb-8 pt-4">
        <p className="mb-4">
          <Link
            to="/cartelera"
            className="text-sm font-medium text-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
          >
            ← Volver a cartelera
          </Link>
        </p>
        <div className="mc-form-panel !max-w-none">
          <MensajeAlerta>{error || 'Ticket no disponible.'}</MensajeAlerta>
        </div>
      </div>
    )
  }

  const confiteria = Array.isArray(ticket.confiteria) ? ticket.confiteria : []

  const estadoColor =
    ticket.estado === 'utilizado'
      ? 'bg-[rgba(161,161,170,0.2)] text-[var(--color-text-light)]'
      : ticket.estado === 'expirado'
        ? 'bg-[rgba(234,84,85,0.15)] text-[var(--color-error)]'
        : 'bg-[rgba(255,122,0,0.18)] text-[var(--color-primary-light)]'

  return (
    <div className="mx-auto max-w-md pb-28 pt-2 md:pb-12">
      <p className="mb-4">
        <Link
          to="/cartelera"
          className="text-sm font-medium text-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
        >
          ← Cartelera
        </Link>
      </p>

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(27,27,37,0.95)_0%,rgba(21,21,29,0.98)_40%,rgba(11,11,15,0.99)_100%)] shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_60px_rgba(255,122,0,0.08)] backdrop-blur-xl"
      >
        <div className="relative px-6 pb-6 pt-8 text-center">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[var(--color-primary-glow)] blur-3xl" />
          <p className="relative mb-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent-gold)]">
            <TicketIcon className="h-3.5 w-3.5" aria-hidden />
            MiniCine Superstar
          </p>
          <h1 className="relative mb-2 text-2xl font-extrabold leading-tight tracking-tight text-[var(--color-text)]">
            {ticket.pelicula || 'Película'}
          </h1>
          <p className="relative mb-4 text-sm text-[var(--color-text-muted)]">
            {fechaTitulo}
            {ticket.hora_inicio ? ` · ${ticket.hora_inicio}` : ''}
            {ticket.hora_fin ? ` – ${ticket.hora_fin}` : ''}
          </p>
          {estadoEtiqueta ? (
            <span
              className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${estadoColor}`}
            >
              {estadoEtiqueta}
            </span>
          ) : null}
        </div>

        <div className="border-t border-[var(--color-border-subtle)] bg-[rgba(11,11,15,0.35)] px-5 py-6 md:px-6">
          <div className="mb-6 flex gap-4">
            <div className="shrink-0">
              {ticket.imagen_url ? (
                <img
                  src={ticket.imagen_url}
                  alt=""
                  className="h-[132px] w-[88px] rounded-lg object-cover shadow-lg ring-1 ring-[var(--color-border-subtle)]"
                />
              ) : (
                <div className="mc-placeholder-img flex h-[132px] w-[88px] items-center justify-center rounded-lg text-[0.65rem]">
                  {ticket.pelicula}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 text-sm text-[var(--color-text-light)]">
              <p className="mb-1.5">
                <span className="text-[var(--color-text-muted)]">Sala</span>{' '}
                <span className="font-semibold text-[var(--color-text)]">{ticket.sala || '—'}</span>
              </p>
              <p className="mb-1.5">
                <span className="text-[var(--color-text-muted)]">Personas</span>{' '}
                <span className="font-semibold text-[var(--color-text)]">{ticket.asientos ?? '—'}</span>
              </p>
              <p className="mb-0 break-all font-mono text-[11px] text-[var(--color-text-muted)]">
                {ticket.codigo_reserva}
              </p>
            </div>
          </div>

          {confiteria.length > 0 ? (
            <div className="mb-6 border-t border-dashed border-[var(--color-border-subtle)] pt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-accent-gold)]">
                Confitería
              </p>
              <ul className="m-0 list-none space-y-1.5 p-0 text-xs text-[var(--color-text-muted)]">
                {confiteria.map((p, idx) => (
                  <li
                    key={`${ticket.codigo_reserva}-c-${idx}`}
                    className="flex justify-between gap-2 border-b border-[rgba(255,255,255,0.04)] pb-1.5 last:border-0"
                  >
                    <span>
                      {p.nombre} × {p.cantidad}
                    </span>
                    <span className="shrink-0 font-medium text-[var(--color-text)]">
                      S/ {typeof p.subtotal === 'number' ? p.subtotal.toFixed(2) : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mb-6 flex items-center justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[rgba(255,122,0,0.06)] px-4 py-3">
            <span className="text-sm text-[var(--color-text-muted)]">Total pagado</span>
            <strong className="text-lg font-extrabold text-[var(--color-primary-light)]">
              S/ {typeof ticket.total === 'number' ? ticket.total.toFixed(2) : '—'}
            </strong>
          </div>

          {ticket.qr_imagen ? (
            <div className="text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-light)]">
                Presenta este QR en el ingreso
              </p>
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.35 }}
                className="inline-block rounded-2xl border border-[rgba(255,122,0,0.35)] bg-white p-4 shadow-[0_0_40px_rgba(255,122,0,0.2)]"
              >
                <img
                  src={ticket.qr_imagen}
                  alt="Código QR de acceso"
                  className="mx-auto block w-[min(280px,72vw)]"
                />
              </motion.div>
            </div>
          ) : null}

          <p className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
            Gracias por elegir MiniCine Superstar
          </p>
        </div>
      </motion.article>
    </div>
  )
}

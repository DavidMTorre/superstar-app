import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Armchair, CalendarDays, Check, Clock, Sparkles } from 'lucide-react'
import { crearReserva, getDisponibilidad, getPeliculas } from '../api/api'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { useInvitado } from '../hooks/useInvitado'
import { cn } from '../lib/cn'
import { mensajeDesdeError } from '../utils/erroresApi'

function peliculaDesdeCartelera(porCategoria, peliculaId) {
  const n = Number(peliculaId)
  if (!porCategoria || Number.isNaN(n)) return null
  for (const lista of Object.values(porCategoria)) {
    const p = lista.find((x) => x.id === n)
    if (p) return p
  }
  return null
}

function fechaMinimaHoy() {
  const d = new Date()
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${da}`
}

function fechaLegibleYmd(ymd) {
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

function claveSlot(item) {
  return `${item.sala_id}:${item.hora_inicio}`
}

function mismoHorario(a, b) {
  if (!a || !b) return false
  return claveSlot(a) === claveSlot(b)
}

function horariosOrdenadosPorSala(disponibilidad, salaId) {
  return disponibilidad
    .filter((d) => d.sala_id === salaId)
    .sort((a, b) => String(a.hora_inicio).localeCompare(String(b.hora_inicio)))
}

function horaInicioParaApi(hora) {
  const s = String(hora).trim()
  if (s.length === 5 && s.includes(':')) return `${s}:00`
  return s
}

export default function ReservaPage({ usuario }) {
  const { peliculaId } = useParams()
  const navegar = useNavigate()
  const { asegurarGuestId } = useInvitado()

  const [cartelera, setCartelera] = useState(null)
  const [fecha, setFecha] = useState('')
  const [disponibilidad, setDisponibilidad] = useState([])
  const [salas, setSalas] = useState([])
  const [salaSeleccionada, setSalaSeleccionada] = useState(null)
  const [horariosFiltrados, setHorariosFiltrados] = useState([])
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cantidadPersonas, setCantidadPersonas] = useState('2')
  const [enviando, setEnviando] = useState(false)

  const pelicula = useMemo(
    () => peliculaDesdeCartelera(cartelera?.por_categoria, peliculaId),
    [cartelera, peliculaId],
  )

  const tituloPelicula =
    pelicula?.titulo ?? (peliculaId ? `Película #${peliculaId}` : '—')

  const backdropUrl = useMemo(() => {
    const u = pelicula?.imagen_url
    return typeof u === 'string' && u.trim() !== '' ? u.trim() : ''
  }, [pelicula?.imagen_url])

  const fechaBonita = useMemo(() => fechaLegibleYmd(fecha), [fecha])

  const precioPorSala = useMemo(() => {
    const m = new Map()
    for (const row of disponibilidad) {
      if (row?.sala_id != null && !m.has(row.sala_id)) {
        m.set(row.sala_id, Number(row.precio))
      }
    }
    return m
  }, [disponibilidad])

  const conteoPorSala = useMemo(() => {
    const m = new Map()
    for (const d of disponibilidad) {
      m.set(d.sala_id, (m.get(d.sala_id) ?? 0) + 1)
    }
    return m
  }, [disponibilidad])

  const pasoActual = useMemo(() => {
    if (horarioSeleccionado) return 3
    if (salaSeleccionada) return 2
    if (fecha) return 1
    return 0
  }, [fecha, horarioSeleccionado, salaSeleccionada])

  useEffect(() => {
    let cancelado = false
    ;(async () => {
      try {
        const resp = await getPeliculas()
        if (!cancelado) setCartelera(resp?.datos ?? null)
      } catch {
        if (!cancelado) setCartelera(null)
      }
    })()
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    const min = fechaMinimaHoy()
    setFecha((prev) => (prev && prev >= min ? prev : min))
  }, [])

  useEffect(() => {
    const id = Number(peliculaId)
    if (!fecha || Number.isNaN(id)) {
      setDisponibilidad([])
      setSalas([])
      setSalaSeleccionada(null)
      setHorariosFiltrados([])
      setHorarioSeleccionado(null)
      return
    }

    let cancelado = false
    async function cargar() {
      setLoading(true)
      setError('')
      setSalaSeleccionada(null)
      setHorariosFiltrados([])
      setHorarioSeleccionado(null)
      try {
        const data = await getDisponibilidad(id, fecha)
        if (cancelado) return
        setDisponibilidad(data)
        const salasUnicas = [...new Map(data.map((item) => [item.sala_id, item])).values()]
        setSalas(salasUnicas)
      } catch (err) {
        if (!cancelado) {
          setDisponibilidad([])
          setSalas([])
          setError(mensajeDesdeError(err))
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    cargar()
    return () => {
      cancelado = true
    }
  }, [fecha, peliculaId])

  function seleccionarSala(sala) {
    setSalaSeleccionada(sala)
    setHorariosFiltrados(horariosOrdenadosPorSala(disponibilidad, sala.sala_id))
    setHorarioSeleccionado(null)
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')

    if (!fecha) {
      setError('Selecciona una fecha')
      return
    }
    if (!horarioSeleccionado) {
      setError('Selecciona un horario')
      return
    }

    setEnviando(true)
    try {
      const carga = {
        pelicula_id: Number(peliculaId),
        sala_id: horarioSeleccionado.sala_id,
        fecha,
        hora_inicio: horaInicioParaApi(horarioSeleccionado.hora_inicio),
        cantidad_personas: Number(cantidadPersonas),
      }

      if (usuario?.id) {
        carga.usuario_id = usuario.id
      } else {
        const gid = await asegurarGuestId()
        carga.guest_id = gid
      }

      const respuesta = await crearReserva(carga)
      const codigo = respuesta?.datos?.reserva?.codigo_reserva
      if (!codigo) {
        setError('No se recibió el código de reserva.')
        return
      }
      navegar('/confiteria', {
        state: {
          codigoReserva: codigo,
          resumen: respuesta.datos.reserva,
        },
      })
    } catch (err) {
      setError(mensajeDesdeError(err))
    } finally {
      setEnviando(false)
    }
  }

  const puedeEnviar =
    !loading &&
    fecha &&
    salas.length > 0 &&
    horarioSeleccionado &&
    !enviando

  const paddingBottomPrincipal =
    horarioSeleccionado && fecha ? 'pb-44 md:pb-10' : 'pb-10 md:pb-12'

  return (
    <div className="relative -mx-4 min-h-[100dvh] overflow-hidden md:-mx-6 lg:-mx-8">
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

      <div className={cn('relative z-10 px-4 md:px-6 lg:px-8', paddingBottomPrincipal)}>
        <p className="mb-5">
          <Link
            to="/cartelera"
            className="inline-flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(11,11,15,0.45)] px-3 py-1.5 text-sm font-semibold text-[var(--color-text)] shadow-sm backdrop-blur-md transition-colors hover:border-[rgba(255,122,0,0.45)] hover:text-[var(--color-primary-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            ← Volver a cartelera
          </Link>
        </p>

        <div className="mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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

            <nav
              className="mb-8 flex flex-wrap gap-2"
              aria-label="Progreso de reserva"
            >
              {[
                { n: 1, label: 'Fecha', ok: Boolean(fecha) },
                { n: 2, label: 'Sala', ok: Boolean(salaSeleccionada) },
                { n: 3, label: 'Horario', ok: Boolean(horarioSeleccionado) },
              ].map((s) => (
                <div
                  key={s.n}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                    pasoActual === s.n
                      ? 'border-[rgba(255,122,0,0.55)] bg-[rgba(255,122,0,0.15)] text-[var(--color-primary-light)] shadow-[0_0_20px_rgba(255,122,0,0.12)]'
                      : s.ok
                        ? 'border-[rgba(40,199,111,0.35)] bg-[rgba(40,199,111,0.08)] text-[var(--color-success)]'
                        : 'border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.03)] text-[var(--color-text-muted)]',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-[10px]',
                      s.ok ? 'bg-[rgba(40,199,111,0.25)] text-[var(--color-success)]' : 'bg-[rgba(255,255,255,0.08)]',
                    )}
                  >
                    {s.ok ? <Check className="h-3 w-3" aria-hidden /> : s.n}
                  </span>
                  {s.label}
                </div>
              ))}
            </nav>

            {error ? <MensajeAlerta>{error}</MensajeAlerta> : null}

            <form id="formulario-reserva" onSubmit={manejarEnvio} className="relative">
              <section className="mc-reserva-bloque">
                <h2 className="mc-reserva-bloque__titulo flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-[var(--color-primary-light)]" aria-hidden />
                  Fecha de la función
                </h2>
                <Input
                  etiqueta="Selecciona el día"
                  name="fecha"
                  type="date"
                  min={fechaMinimaHoy()}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                  inputClassName="mc-reserva-fecha-input"
                />
                {fecha ? (
                  <p className="mt-2 rounded-lg border border-[var(--color-border-subtle)] bg-[rgba(255,122,0,0.06)] px-3 py-2 text-sm capitalize leading-snug text-[var(--color-text-light)]">
                    <span className="font-semibold text-[var(--color-text)]">{fechaBonita}</span>
                  </p>
                ) : null}
                {!fecha && !loading ? (
                  <p className="mc-reserva-ayuda">Selecciona una fecha</p>
                ) : null}
              </section>

              <section className="mc-reserva-bloque">
                <h2 className="mc-reserva-bloque__titulo flex items-center gap-2">
                  <Armchair className="h-5 w-5 text-[var(--color-primary-light)]" aria-hidden />
                  Salas disponibles
                </h2>
                {loading ? (
                  <p className="mc-reserva-loading mc-reserva-ayuda">Cargando disponibilidad…</p>
                ) : null}

                {!loading && fecha && !error && salas.length === 0 ? (
                  <p className="mc-reserva-ayuda">No hay disponibilidad</p>
                ) : null}

                {!loading && salas.length > 0 ? (
                  <>
                    <p className="mb-4 flex flex-wrap gap-4 text-[11px] text-[var(--color-text-muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[var(--color-text-muted)]" aria-hidden />
                        Disponible
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary-glow)]"
                          aria-hidden
                        />
                        Tu sala
                      </span>
                    </p>
                    <div className="mc-reserva-grid-salas">
                      {salas.map((sala) => {
                        const activa = salaSeleccionada?.sala_id === sala.sala_id
                        const n = conteoPorSala.get(sala.sala_id) ?? 0
                        const precio = precioPorSala.get(sala.sala_id)
                        return (
                          <motion.button
                            key={sala.sala_id}
                            type="button"
                            layout
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                            className={cn(
                              'flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
                              activa
                                ? 'border-[rgba(255,122,0,0.65)] bg-[rgba(255,122,0,0.14)] shadow-[0_0_36px_rgba(255,122,0,0.22)]'
                                : 'border-[var(--color-border-subtle)] bg-[rgba(27,27,37,0.55)] shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:border-[rgba(255,122,0,0.45)] hover:shadow-[0_0_28px_rgba(255,122,0,0.12)]',
                            )}
                            onClick={() => seleccionarSala(sala)}
                            aria-pressed={activa}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-gold)]">
                              Sala Superstar
                            </span>
                            <span className="text-lg font-bold leading-tight text-[var(--color-text)]">
                              {sala.sala}
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)]">
                              Butacas numeradas · sonido envolvente
                            </span>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--color-border-subtle)] pt-2 text-xs text-[var(--color-text-light)]">
                              <span>
                                {n} {n === 1 ? 'función' : 'funciones'} ese día
                              </span>
                              {precio != null && !Number.isNaN(precio) ? (
                                <span className="font-bold text-[var(--color-primary-light)]">
                                  Desde S/ {precio.toFixed(2)}
                                </span>
                              ) : null}
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </>
                ) : null}
              </section>

              {salaSeleccionada ? (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mc-reserva-bloque"
                >
                  <h2 className="mc-reserva-bloque__titulo flex flex-wrap items-center gap-2">
                    <Clock className="h-5 w-5 text-[var(--color-primary-light)]" aria-hidden />
                    Horarios
                    <span className="text-sm font-medium text-[var(--color-text-muted)]">
                      · {salaSeleccionada.sala}
                    </span>
                  </h2>
                  <div className="flex flex-wrap gap-2.5">
                    {horariosFiltrados.map((h) => {
                      const activo = mismoHorario(horarioSeleccionado, h)
                      return (
                        <motion.button
                          key={claveSlot(h)}
                          type="button"
                          layout
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.97 }}
                          className={cn(
                            'min-w-[8.5rem] flex-1 rounded-2xl border px-4 py-3 text-center transition-shadow sm:min-w-[9.5rem] sm:flex-none',
                            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
                            activo
                              ? 'border-[rgba(255,122,0,0.75)] bg-[rgba(255,122,0,0.18)] shadow-[0_0_28px_rgba(255,122,0,0.25)]'
                              : 'border-[var(--color-border-subtle)] bg-[rgba(27,27,37,0.6)] hover:border-[rgba(255,122,0,0.4)] hover:shadow-[0_0_20px_rgba(255,122,0,0.1)]',
                          )}
                          onClick={() => setHorarioSeleccionado(h)}
                          aria-pressed={activo}
                        >
                          <span className="block text-sm font-bold text-[var(--color-text)]">
                            {h.hora_inicio} – {h.hora_fin}
                          </span>
                          <span className="mt-1 block text-xs font-extrabold text-[var(--color-primary-light)]">
                            S/ {Number(h.precio).toFixed(2)}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.section>
              ) : null}

              {horarioSeleccionado && fecha ? (
                <section className="mc-reserva-bloque mc-reserva-bloque--resumen">
                  <h2 className="mc-reserva-bloque__titulo">Resumen</h2>
                  <div className="mc-reserva-resumen-card">
                    <p style={{ margin: 0 }}>
                      <strong>Película:</strong> {tituloPelicula}
                    </p>
                    <p style={{ margin: '0.35rem 0 0' }}>
                      <strong>Sala:</strong> {horarioSeleccionado.sala}
                    </p>
                    <p style={{ margin: '0.35rem 0 0' }}>
                      <strong>Fecha:</strong> {fecha}
                    </p>
                    <p style={{ margin: '0.35rem 0 0' }}>
                      <strong>Horario:</strong> {horarioSeleccionado.hora_inicio} –{' '}
                      {horarioSeleccionado.hora_fin}
                    </p>
                    <p
                      style={{
                        margin: '0.5rem 0 0',
                        fontWeight: 700,
                        color: 'var(--color-primary-light)',
                      }}
                    >
                      Precio: S/ {Number(horarioSeleccionado.precio).toFixed(2)}
                    </p>
                  </div>
                </section>
              ) : (
                <p className="mc-reserva-ayuda mc-reserva-bloque">
                  {!usuario ? (
                    <>Modo invitado: se creará una sesión temporal si es necesario.</>
                  ) : (
                    <>Elige fecha, sala y horario para ver el resumen.</>
                  )}
                </p>
              )}

              <Input
                etiqueta="Cantidad de personas (máx. 4)"
                name="cantidad_personas"
                type="number"
                min={1}
                max={4}
                value={cantidadPersonas}
                onChange={(e) => setCantidadPersonas(e.target.value)}
                required
              />

              <p className="mc-reserva-ayuda" style={{ marginBottom: 'var(--space-md)' }}>
                Los horarios dependen de la duración de la película, la limpieza de la sala y las reservas
                existentes.
              </p>

              <Button
                type="submit"
                variante="primario"
                anchoCompleto
                cargando={enviando}
                disabled={!puedeEnviar}
                className="!hidden md:!inline-flex"
              >
                Confirmar reserva
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {horarioSeleccionado && fecha ? (
        <div
          className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] left-3 right-3 z-30 rounded-2xl border border-[rgba(255,122,0,0.4)] bg-[rgba(11,11,15,0.88)] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl md:hidden"
          role="status"
          aria-live="polite"
        >
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-gold)]">
            Resumen rápido
          </p>
          <p className="mb-3 line-clamp-2 text-sm font-semibold text-[var(--color-text)]">{tituloPelicula}</p>
          <p className="mb-3 text-xs text-[var(--color-text-muted)]">
            {fecha} · {horarioSeleccionado.hora_inicio} – {horarioSeleccionado.hora_fin} ·{' '}
            <span className="font-bold text-[var(--color-primary-light)]">
              S/ {Number(horarioSeleccionado.precio).toFixed(2)}
            </span>
          </p>
          <Button
            type="submit"
            form="formulario-reserva"
            variante="primario"
            anchoCompleto
            cargando={enviando}
            disabled={!puedeEnviar}
          >
            Confirmar reserva
          </Button>
        </div>
      ) : null}
    </div>
  )
}

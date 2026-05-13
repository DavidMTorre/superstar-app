import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Play, Search, Sparkles, Star, Ticket } from 'lucide-react'
import { getPeliculas } from '../api/api'
import { Card } from '../components/Card'
import { Cargando } from '../components/Cargando'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { cn } from '../lib/cn'
import { mensajeDesdeError } from '../utils/erroresApi'

function peliculasUnicasPorOrden(porCategoria, categoriasOrdenadas) {
  const vista = new Map()
  for (const nombreCat of categoriasOrdenadas) {
    const lista = porCategoria?.[nombreCat]
    if (!Array.isArray(lista)) continue
    for (const p of lista) {
      const id = p?.id
      if (id == null || vista.has(id)) continue
      vista.set(id, { ...p, _categoria: nombreCat })
    }
  }
  return [...vista.values()]
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
}

const TarjetaPelicula = memo(function TarjetaPelicula({ pelicula }) {
  const titulo = pelicula?.titulo || 'Sin título'
  const imagen = pelicula?.imagen_url

  return (
    <motion.div variants={itemVariants} className="shrink-0 snap-start" style={{ width: 'min(42vw, 200px)' }}>
      <Card interactiva className="h-full overflow-hidden">
        <Link to={`/reserva/${pelicula?.id}`} className="block text-inherit no-underline">
          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.25 }} className="overflow-hidden rounded-t-[inherit]">
            {imagen ? (
              <img src={imagen} alt="" className="aspect-[2/3] w-full object-cover" />
            ) : (
              <div className="mc-placeholder-img aspect-[2/3]">{titulo}</div>
            )}
          </motion.div>
          <div className="mc-card__body">
            <h3 className="mc-card__titulo line-clamp-2 min-h-[2.5rem] text-[0.9rem] leading-snug">{titulo}</h3>
            <p className="mb-0 mt-1 text-[0.75rem] text-[var(--color-text-muted)]">
              {pelicula?.duracion ? `${pelicula.duracion} min` : '\u00a0'}
            </p>
          </div>
        </Link>
      </Card>
    </motion.div>
  )
})

function FilaTitulo({ icon: Icon, titulo, subtitulo }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div className="flex items-center gap-2">
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(255,122,0,0.12)] text-[var(--color-primary-light)] shadow-[0_0_20px_rgba(255,122,0,0.12)]">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <div>
          <h2 className="mb-0 text-lg font-bold tracking-tight text-[var(--color-text)] md:text-xl">{titulo}</h2>
          {subtitulo ? <p className="mb-0 mt-0.5 text-xs text-[var(--color-text-muted)] md:text-sm">{subtitulo}</p> : null}
        </div>
      </div>
    </div>
  )
}

function FilaStreaming({ titulo, subtitulo, icon, peliculas }) {
  const lista = Array.isArray(peliculas) ? peliculas : []
  if (lista.length === 0) return null

  return (
    <section className="mb-10 md:mb-14">
      <FilaTitulo icon={icon} titulo={titulo} subtitulo={subtitulo} />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] md:-mx-6 md:px-6 lg:-mx-8 lg:px-8"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {lista.map((pelicula) => (
          <TarjetaPelicula key={pelicula?.id} pelicula={pelicula} />
        ))}
      </motion.div>
    </section>
  )
}

function gridPeliculas(peliculas) {
  const lista = Array.isArray(peliculas) ? peliculas : []
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="mc-grid-peliculas"
    >
      {lista.map((pelicula) => (
        <TarjetaPelicula key={pelicula?.id} pelicula={pelicula} />
      ))}
    </motion.div>
  )
}

export default function CarteleraPage() {
  const [busqueda, setBusqueda] = useState('')
  const [porCategoria, setPorCategoria] = useState({})
  /** @type {Array<Record<string, unknown>>} */
  const [peliculasLista, setPeliculasLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cargaInicial, setCargaInicial] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    const timeoutId = setTimeout(() => {
      async function cargarPeliculas() {
        setCargando(true)
        setError('')
        try {
          const termino = busqueda.trim()
          const res = await getPeliculas(termino ? { buscar: termino } : {})
          if (cancelado) return

          if (termino) {
            const datos = res?.datos
            setPeliculasLista(Array.isArray(datos) ? datos : [])
            setPorCategoria({})
          } else {
            setPeliculasLista([])
            setPorCategoria(res?.datos?.por_categoria ?? {})
          }
        } catch (err) {
          if (!cancelado) {
            setError(mensajeDesdeError(err))
          }
        } finally {
          if (!cancelado) {
            setCargando(false)
            setCargaInicial(false)
          }
        }
      }

      void cargarPeliculas()
    }, 300)

    return () => {
      cancelado = true
      clearTimeout(timeoutId)
    }
  }, [busqueda])

  const hayBusqueda = useMemo(() => busqueda.trim().length > 0, [busqueda])
  const categoriasOrdenadas = useMemo(() => Object.keys(porCategoria ?? {}).sort(), [porCategoria])
  const sinPeliculasNiCategorias =
    Object.keys(porCategoria ?? {}).length === 0 && peliculasLista.length === 0

  const todasOrden = useMemo(
    () => peliculasUnicasPorOrden(porCategoria, categoriasOrdenadas),
    [porCategoria, categoriasOrdenadas],
  )

  const heroPelicula = useMemo(() => {
    const conImg = todasOrden.find((p) => p?.imagen_url)
    return conImg ?? todasOrden[0] ?? null
  }, [todasOrden])

  const estrenos = useMemo(() => todasOrden.slice(0, 8), [todasOrden])
  const masReservadas = useMemo(() => todasOrden.slice(4, 12), [todasOrden])
  const recomendadas = useMemo(() => todasOrden.slice(8, 16), [todasOrden])
  const proximamente = useMemo(() => todasOrden.slice(12, 20), [todasOrden])

  const onCambioBusqueda = useCallback((e) => {
    setBusqueda(e.target.value)
  }, [])

  if (cargaInicial && cargando) {
    return <Cargando mensaje="Cargando cartelera…" />
  }

  if (error && sinPeliculasNiCategorias) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)]/80 p-6 backdrop-blur-md">
        <MensajeAlerta>{error}</MensajeAlerta>
        <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
          Comprueba que el servidor Laravel esté en ejecución y la URL en{' '}
          <code className="rounded bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-[var(--color-primary-light)]">
            .env
          </code>{' '}
          (VITE_API_URL) o el proxy de Vite.
        </p>
      </div>
    )
  }

  return (
    <div className="pb-4">
      {!hayBusqueda && heroPelicula ? (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative -mx-4 mb-10 min-h-[min(72vh,520px)] overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] md:-mx-6 lg:-mx-8"
        >
          {heroPelicula.imagen_url ? (
            <>
              <img
                src={heroPelicula.imagen_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
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
              {heroPelicula.titulo || 'Cartelera'}
            </h1>
            <p className="mb-6 max-w-lg text-sm text-[var(--color-text-light)] md:text-base">
              Reserva tu función con experiencia premium. Elige sala, horario y disfruta en MiniCine Superstar.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/reserva/${heroPelicula.id}`}
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
      ) : null}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-extrabold tracking-tight md:text-3xl">Cartelera</h1>
          <p className="mb-0 text-sm text-[var(--color-text-muted)] md:text-base">
            Busca por título o explora nuestras colecciones.
          </p>
        </div>
      </div>

      <div className="relative mb-8 max-w-xl">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
          aria-hidden
        />
        <label htmlFor="buscarPelicula" className="sr-only">
          Buscar película
        </label>
        <input
          id="buscarPelicula"
          type="search"
          className={cn(
            'mc-input w-full rounded-xl py-3 pl-11 pr-4',
            'border-[var(--color-border-subtle)] bg-[var(--color-card)]/90',
          )}
          placeholder="Buscar por título…"
          value={busqueda}
          onChange={onCambioBusqueda}
          autoComplete="off"
        />
      </div>

      {cargando ? (
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">Actualizando…</p>
      ) : null}

      {error && !cargando ? (
        <div className="mb-4">
          <MensajeAlerta>{error}</MensajeAlerta>
        </div>
      ) : null}

      {hayBusqueda ? (
        <>
          <h2 className="mb-4 text-lg font-bold">Resultados</h2>
          {!cargando && peliculasLista.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-card)]/50 p-8 text-center text-[var(--color-text-muted)]">
              No hay películas que coincidan con «{busqueda.trim()}».
            </p>
          ) : null}
          {peliculasLista.length > 0 ? gridPeliculas(peliculasLista) : null}
        </>
      ) : (
        <>
          {todasOrden.length > 0 ? (
            <>
              <FilaStreaming
                titulo="Estrenos"
                subtitulo="Lo más reciente en cartelera"
                icon={Sparkles}
                peliculas={estrenos}
              />
              <FilaStreaming
                titulo="Más reservadas"
                subtitulo="Funciones con mayor demanda"
                icon={Ticket}
                peliculas={masReservadas}
              />
              <FilaStreaming
                titulo="Recomendadas para ti"
                subtitulo="Selección editorial Superstar"
                icon={Star}
                peliculas={recomendadas}
              />
              <FilaStreaming
                titulo="Próximamente"
                subtitulo="No te pierdas estos estrenos"
                icon={Play}
                peliculas={proximamente}
              />
            </>
          ) : null}

          <section className="mt-4" id="catalogo">
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text)] md:text-xl">Por categoría</h2>
            <p className="mb-6 text-sm text-[var(--color-text-muted)]">
              Explora el catálogo organizado por género o temática.
            </p>
            {categoriasOrdenadas.length === 0 && !cargando ? (
              <p className="text-[var(--color-text-muted)]">No hay películas disponibles por ahora.</p>
            ) : null}
            {categoriasOrdenadas.map((nombreCat) => (
              <section key={nombreCat} className="mc-seccion-categoria">
                <h2>{nombreCat}</h2>
                {gridPeliculas(porCategoria?.[nombreCat])}
              </section>
            ))}
          </section>
        </>
      )}
    </div>
  )
}

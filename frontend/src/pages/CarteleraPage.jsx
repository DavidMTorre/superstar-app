import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPeliculas } from '../api/api'
import { Card } from '../components/Card'
import { Cargando } from '../components/Cargando'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { mensajeDesdeError } from '../utils/erroresApi'

function gridPeliculas(peliculas) {
  const lista = Array.isArray(peliculas) ? peliculas : []
  return (
    <div className="mc-grid-peliculas">
      {lista.map((pelicula) => (
        <TarjetaPelicula key={pelicula?.id} pelicula={pelicula} />
      ))}
    </div>
  )
}

const TarjetaPelicula = memo(function TarjetaPelicula({ pelicula }) {
  const titulo = pelicula?.titulo || 'Sin título'
  const imagen = pelicula?.imagen_url

  return (
    <Card interactiva>
      <Link
        to={`/reserva/${pelicula?.id}`}
        style={{ color: 'inherit', display: 'block' }}
      >
        {imagen ? (
          <img src={imagen} alt="" style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
        ) : (
          <div className="mc-placeholder-img">{titulo}</div>
        )}
        <div className="mc-card__body">
          <h3 className="mc-card__titulo">{titulo}</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
            {pelicula?.duracion ? `${pelicula.duracion} min` : ''}
          </p>
        </div>
      </Link>
    </Card>
  )
})

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

  const onCambioBusqueda = useCallback((e) => {
    setBusqueda(e.target.value)
  }, [])

  if (cargaInicial && cargando) {
    return <Cargando mensaje="Cargando cartelera…" />
  }

  if (error && sinPeliculasNiCategorias) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <MensajeAlerta>{error}</MensajeAlerta>
        <p style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>
          Comprueba que el servidor Laravel esté en ejecución y la URL en{' '}
          <code>.env</code> (VITE_API_URL) o el proxy de Vite.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>Cartelera</h1>
      <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-md)' }}>
        Busca por título (el filtrado lo hace el servidor) o revisa el destacado por categoría.
      </p>

      <div style={{ marginBottom: 'var(--space-xl)', maxWidth: '420px' }}>
        <label htmlFor="buscarPelicula" className="mc-input-wrap">
          <span style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Buscar película</span>
          <input
            id="buscarPelicula"
            type="search"
            className="mc-input"
            placeholder="Buscar por título…"
            value={busqueda}
            onChange={onCambioBusqueda}
            autoComplete="off"
          />
        </label>
      </div>

      {cargando ? (
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: 'var(--space-md)' }}>
          Actualizando…
        </p>
      ) : null}

      {error && !cargando ? (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <MensajeAlerta>{error}</MensajeAlerta>
        </div>
      ) : null}

      {hayBusqueda ? (
        <>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-md)' }}>Resultados</h2>
          {!cargando && peliculasLista.length === 0 ? (
            <p>No hay películas que coincidan con «{busqueda.trim()}».</p>
          ) : null}
          {peliculasLista.length > 0 ? gridPeliculas(peliculasLista) : null}
        </>
      ) : (
        <>
          <h2 style={{ fontSize: '1.05rem', marginBottom: 'var(--space-md)', fontWeight: 600 }}>
            Destacadas por categoría
          </h2>
          {categoriasOrdenadas.length === 0 && !cargando ? (
            <p>No hay películas disponibles por ahora.</p>
          ) : null}
          {categoriasOrdenadas.map((nombreCat) => (
            <section key={nombreCat} className="mc-seccion-categoria">
              <h2>{nombreCat}</h2>
              {gridPeliculas(porCategoria?.[nombreCat])}
            </section>
          ))}
        </>
      )}
    </div>
  )
}
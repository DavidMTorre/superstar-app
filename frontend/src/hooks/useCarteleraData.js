import { useCallback, useEffect, useMemo, useState } from 'react'
import { getPeliculas } from '../api/api'
import { peliculasUnicasPorOrden } from '../utils/carteleraHelpers'
import { mensajeDesdeError } from '../utils/erroresApi'

const DEBOUNCE_MS = 300

/**
 * Carga cartelera con debounce en búsqueda; mismo contrato que la página original.
 */
export function useCarteleraData() {
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
    }, DEBOUNCE_MS)

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

  return {
    busqueda,
    porCategoria,
    peliculasLista,
    cargando,
    cargaInicial,
    error,
    hayBusqueda,
    categoriasOrdenadas,
    sinPeliculasNiCategorias,
    todasOrden,
    heroPelicula,
    estrenos,
    masReservadas,
    recomendadas,
    proximamente,
    onCambioBusqueda,
  }
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { crearReserva, getDisponibilidad, getPeliculas } from '../api/api'
import { ReservaBackdrop } from '../components/reserva/ReservaBackdrop'
import { ReservaCabeceraPanel } from '../components/reserva/ReservaCabeceraPanel'
import { ReservaDockMovil } from '../components/reserva/ReservaDockMovil'
import { ReservaFormularioContenido } from '../components/reserva/ReservaFormularioContenido'
import { useInvitado } from '../hooks/useInvitado'
import { cn } from '../lib/cn'
import {
  fechaLegibleYmd,
  fechaMinimaHoy,
  horaInicioParaApiReserva,
  horariosOrdenadosPorSala,
  mapaConteoPorSala,
  mapaPrecioPorSala,
  pasoReservaActual,
  peliculaDesdeCartelera,
} from '../utils/reservaHelpers'
import { mensajeDesdeError } from '../utils/erroresApi'

export default function ReservaPage({ usuario }) {
  const { peliculaId } = useParams()
  const navegar = useNavigate()
  const { asegurarGuestId } = useInvitado()

  const [cartelera, setCartelera] = useState(null)
  const [fecha, setFecha] = useState(() => fechaMinimaHoy())
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

  const precioPorSala = useMemo(() => mapaPrecioPorSala(disponibilidad), [disponibilidad])

  const conteoPorSala = useMemo(() => mapaConteoPorSala(disponibilidad), [disponibilidad])

  const pasoActual = useMemo(
    () => pasoReservaActual(fecha, salaSeleccionada, horarioSeleccionado),
    [fecha, horarioSeleccionado, salaSeleccionada],
  )

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
    const id = Number(peliculaId)
    let cancelado = false

    async function cargar() {
      if (!fecha || Number.isNaN(id)) {
        setDisponibilidad([])
        setSalas([])
        setSalaSeleccionada(null)
        setHorariosFiltrados([])
        setHorarioSeleccionado(null)
        return
      }

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

    void cargar()
    return () => {
      cancelado = true
    }
  }, [fecha, peliculaId])

  const seleccionarSala = useCallback(
    (sala) => {
      setSalaSeleccionada(sala)
      setHorariosFiltrados(horariosOrdenadosPorSala(disponibilidad, sala.sala_id))
      setHorarioSeleccionado(null)
    },
    [disponibilidad],
  )

  const manejarEnvio = useCallback(
    async (e) => {
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
          hora_inicio: horaInicioParaApiReserva(horarioSeleccionado.hora_inicio),
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
    },
    [
      asegurarGuestId,
      cantidadPersonas,
      fecha,
      horarioSeleccionado,
      navegar,
      peliculaId,
      usuario,
    ],
  )

  const puedeEnviar =
    !loading &&
    fecha &&
    salas.length > 0 &&
    horarioSeleccionado &&
    !enviando

  const paddingBottomPrincipal =
    horarioSeleccionado && fecha ? 'pb-44 md:pb-10' : 'pb-10 md:pb-12'

  const onCambioFecha = useCallback((e) => {
    setFecha(e.target.value)
  }, [])

  const onCambioCantidad = useCallback((e) => {
    setCantidadPersonas(e.target.value)
  }, [])

  const onSeleccionarHorario = useCallback((h) => {
    setHorarioSeleccionado(h)
  }, [])

  return (
    <div className="relative -mx-4 min-h-[100dvh] overflow-hidden md:-mx-6 lg:-mx-8">
      <ReservaBackdrop backdropUrl={backdropUrl} />

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
          <ReservaCabeceraPanel backdropUrl={backdropUrl} tituloPelicula={tituloPelicula}>
            <ReservaFormularioContenido
              error={error}
              pasoActual={pasoActual}
              tieneFecha={Boolean(fecha)}
              tieneSala={Boolean(salaSeleccionada)}
              tieneHorario={Boolean(horarioSeleccionado)}
              fecha={fecha}
              fechaBonita={fechaBonita}
              loading={loading}
              onCambioFecha={onCambioFecha}
              salas={salas}
              salaSeleccionada={salaSeleccionada}
              horariosFiltrados={horariosFiltrados}
              horarioSeleccionado={horarioSeleccionado}
              conteoPorSala={conteoPorSala}
              precioPorSala={precioPorSala}
              onSeleccionarSala={seleccionarSala}
              onSeleccionarHorario={onSeleccionarHorario}
              tituloPelicula={tituloPelicula}
              fechaResumen={fecha}
              usuario={usuario}
              cantidadPersonas={cantidadPersonas}
              onCambioCantidadPersonas={onCambioCantidad}
              onSubmit={manejarEnvio}
              puedeEnviar={puedeEnviar}
              enviando={enviando}
            />
          </ReservaCabeceraPanel>
        </div>
      </div>

      <ReservaDockMovil
        visible={Boolean(horarioSeleccionado && fecha)}
        tituloPelicula={tituloPelicula}
        fecha={fecha}
        horarioSeleccionado={horarioSeleccionado}
        puedeEnviar={puedeEnviar}
        enviando={enviando}
      />
    </div>
  )
}

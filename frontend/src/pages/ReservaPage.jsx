import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { crearReserva, getDisponibilidad, getPeliculas } from '../api/api'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { useInvitado } from '../hooks/useInvitado'
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
    [cartelera, peliculaId]
  )

  const tituloPelicula =
    pelicula?.titulo ?? (peliculaId ? `Película #${peliculaId}` : '—')

  const conteoPorSala = useMemo(() => {
    const m = new Map()
    for (const d of disponibilidad) {
      m.set(d.sala_id, (m.get(d.sala_id) ?? 0) + 1)
    }
    return m
  }, [disponibilidad])

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

  return (
    <div style={{ paddingTop: 'var(--space-lg)' }}>
      <p style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/cartelera">← Volver a cartelera</Link>
      </p>
      <div className="mc-form-panel">
        <h1 style={{ marginBottom: 'var(--space-sm)' }}>Reservar función</h1>

        <div
          style={{
            marginBottom: 'var(--space-md)',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 107, 0, 0.08)',
            border: '1px solid rgba(255, 107, 0, 0.25)',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
            Película elegida
          </p>
          <p style={{ margin: '0.35rem 0 0', fontSize: '1.15rem', fontWeight: 700 }}>
            {tituloPelicula}
          </p>
          {!pelicula && peliculaId ? (
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
              Si no ves el título, vuelve a la cartelera y entra desde el póster de la película.
            </p>
          ) : null}
        </div>

        {error ? <MensajeAlerta>{error}</MensajeAlerta> : null}

        <form onSubmit={manejarEnvio}>
          {/* Bloque: Fecha */}
          <section className="mc-reserva-bloque">
            <h2 className="mc-reserva-bloque__titulo">Fecha</h2>
            <Input
              etiqueta="Fecha de la función"
              name="fecha"
              type="date"
              min={fechaMinimaHoy()}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
            {!fecha && !loading ? (
              <p className="mc-reserva-ayuda">Selecciona una fecha</p>
            ) : null}
          </section>

          {/* Bloque: Salas */}
          <section className="mc-reserva-bloque">
            <h2 className="mc-reserva-bloque__titulo">Salas</h2>
            {loading ? (
              <p className="mc-reserva-loading mc-reserva-ayuda">Cargando disponibilidad…</p>
            ) : null}

            {!loading && fecha && !error && salas.length === 0 ? (
              <p className="mc-reserva-ayuda">No hay disponibilidad</p>
            ) : null}

            {!loading && salas.length > 0 ? (
              <div className="mc-reserva-grid-salas">
                {salas.map((sala) => {
                  const activa = salaSeleccionada?.sala_id === sala.sala_id
                  const n = conteoPorSala.get(sala.sala_id) ?? 0
                  return (
                    <button
                      key={sala.sala_id}
                      type="button"
                      className={`mc-btn mc-btn--opcion mc-reserva-sala-btn ${activa ? 'mc-btn--activo' : ''}`}
                      onClick={() => seleccionarSala(sala)}
                      aria-pressed={activa}
                    >
                      <span className="mc-reserva-sala-btn__nombre">{sala.sala}</span>
                      <span className="mc-reserva-sala-btn__meta">
                        {n} {n === 1 ? 'horario disponible' : 'horarios disponibles'}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : null}
          </section>

          {/* Bloque: Horarios (solo sala elegida) */}
          {salaSeleccionada ? (
            <section className="mc-reserva-bloque">
              <h2 className="mc-reserva-bloque__titulo">
                Horarios · {salaSeleccionada.sala}
              </h2>
              <div className="mc-reserva-grid-horarios">
                {horariosFiltrados.map((h) => {
                  const activo = mismoHorario(horarioSeleccionado, h)
                  return (
                    <button
                      key={claveSlot(h)}
                      type="button"
                      className={`mc-btn mc-btn--opcion mc-reserva-hora-btn ${activo ? 'mc-btn--activo' : ''}`}
                      onClick={() => setHorarioSeleccionado(h)}
                      aria-pressed={activo}
                    >
                      <span className="mc-reserva-hora-btn__rango">
                        {h.hora_inicio} – {h.hora_fin}
                      </span>
                      <span className="mc-reserva-hora-btn__precio">
                        S/ {Number(h.precio).toFixed(2)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ) : null}

          {/* Bloque: Resumen */}
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
                    color: 'var(--color-primary-dark)',
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
          >
            Confirmar reserva
          </Button>
        </form>
      </div>
    </div>
  )
}

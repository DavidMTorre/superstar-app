import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  getAdminSalaHorarios,
  getAdminSalas,
  postAdminSalaHorario,
  putAdminSalaHorario,
} from '../../api/api'
import { Button } from '../../components/Button'
import { MensajeAlerta } from '../../components/MensajeAlerta'
import { mensajeDesdeError } from '../../utils/erroresApi'

const DIAS = [
  { dia: 0, etiqueta: 'Domingo' },
  { dia: 1, etiqueta: 'Lunes' },
  { dia: 2, etiqueta: 'Martes' },
  { dia: 3, etiqueta: 'Miércoles' },
  { dia: 4, etiqueta: 'Jueves' },
  { dia: 5, etiqueta: 'Viernes' },
  { dia: 6, etiqueta: 'Sábado' },
]

function filasVacias() {
  return DIAS.map(({ dia }) => ({
    dia_semana: dia,
    id: null,
    hora_apertura: '',
    hora_cierre: '',
  }))
}

function fusionarHorariosApi(filas, horariosApi) {
  const porDia = new Map(
    (horariosApi ?? []).map((h) => [h.dia_semana, h])
  )
  return filas.map((f) => {
    const h = porDia.get(f.dia_semana)
    if (!h) return f
    return {
      dia_semana: f.dia_semana,
      id: h.id,
      hora_apertura: h.hora_apertura ?? '',
      hora_cierre: h.hora_cierre ?? '',
    }
  })
}

export default function SalasHorariosAdmin() {
  const { token } = useOutletContext()
  const [salas, setSalas] = useState([])
  const [salaId, setSalaId] = useState(null)
  const [filas, setFilas] = useState(filasVacias)
  const [cargandoSalas, setCargandoSalas] = useState(true)
  const [cargandoHorarios, setCargandoHorarios] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  const cargarSalas = useCallback(async () => {
    setError('')
    try {
      const r = await getAdminSalas(token)
      setSalas(r?.datos?.salas ?? [])
    } catch (e) {
      setError(mensajeDesdeError(e))
      setSalas([])
    } finally {
      setCargandoSalas(false)
    }
  }, [token])

  const cargarHorarios = useCallback(
    async (id) => {
      if (!id) {
        setFilas(filasVacias())
        return
      }
      setCargandoHorarios(true)
      setError('')
      try {
        const r = await getAdminSalaHorarios(token, id)
        const lista = r?.datos?.horarios ?? []
        setFilas(fusionarHorariosApi(filasVacias(), lista))
      } catch (e) {
        setError(mensajeDesdeError(e))
        setFilas(filasVacias())
      } finally {
        setCargandoHorarios(false)
      }
    },
    [token]
  )

  useEffect(() => {
    cargarSalas()
  }, [cargarSalas])

  useEffect(() => {
    if (salaId) cargarHorarios(salaId)
    else setFilas(filasVacias())
  }, [salaId, cargarHorarios])

  function actualizarFila(dia, campo, valor) {
    setFilas((prev) =>
      prev.map((f) =>
        f.dia_semana === dia ? { ...f, [campo]: valor } : f
      )
    )
  }

  const puedeGuardar = useMemo(
    () => salaId != null && !cargandoHorarios,
    [salaId, cargandoHorarios]
  )

  async function guardarConfiguracion() {
    if (!salaId) return
    setGuardando(true)
    setError('')
    setExito('')
    try {
      for (const fila of filas) {
        const a = fila.hora_apertura?.trim()
        const c = fila.hora_cierre?.trim()
        if (!a || !c) continue

        const cuerpoBase = {
          hora_apertura: a.length === 5 ? `${a}:00` : a,
          hora_cierre: c.length === 5 ? `${c}:00` : c,
        }

        if (fila.id) {
          await putAdminSalaHorario(token, salaId, fila.id, cuerpoBase)
        } else {
          await postAdminSalaHorario(token, salaId, {
            dia_semana: fila.dia_semana,
            ...cuerpoBase,
          })
        }
      }
      setExito('Horarios guardados.')
      await cargarHorarios(salaId)
    } catch (e) {
      setError(mensajeDesdeError(e))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      <header className="admin-page-hero admin-page-hero--orange">
        <h1 className="admin-page-hero__title">Horarios de atención por sala</h1>
        <p className="admin-page-hero__subtitle">
          Define apertura y cierre por día (0 = domingo … 6 = sábado). Los clientes solo podrán
          reservar dentro de estos rangos.
        </p>
      </header>

      {error ? (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <MensajeAlerta>{error}</MensajeAlerta>
        </div>
      ) : null}
      {exito ? (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <MensajeAlerta tipo="exito">{exito}</MensajeAlerta>
        </div>
      ) : null}

      <div className="admin-form-panel admin-accent-border">
        <div className="mc-input-wrap" style={{ marginBottom: 'var(--space-lg)' }}>
          <label htmlFor="salaHorarioSelect">Sala</label>
          <select
            id="salaHorarioSelect"
            className="mc-input"
            value={salaId ?? ''}
            onChange={(e) => {
              const v = e.target.value
              setSalaId(v === '' ? null : Number(v))
              setExito('')
            }}
            disabled={cargandoSalas}
          >
            <option value="">— Selecciona una sala —</option>
            {salas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        {cargandoHorarios ? (
          <p style={{ color: 'var(--color-text-light)' }}>Cargando horarios…</p>
        ) : salaId ? (
          <>
            <p style={{ marginBottom: 'var(--space-md)', fontSize: '0.95rem' }}>
              Completa apertura y cierre para los días que la sala atiende. Deja vacío un día si no
              abre (no se creará registro hasta que guardes con horas).
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Día</th>
                    <th>Apertura</th>
                    <th>Cierre</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f) => {
                    const meta = DIAS.find((d) => d.dia === f.dia_semana)
                    return (
                      <tr key={f.dia_semana}>
                        <td>
                          <strong>{meta?.etiqueta ?? f.dia_semana}</strong>
                          {f.id ? (
                            <span
                              style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.8rem',
                                color: 'var(--color-text-light)',
                              }}
                            >
                              (id {f.id})
                            </span>
                          ) : null}
                        </td>
                        <td>
                          <input
                            type="time"
                            className="mc-input"
                            value={
                              f.hora_apertura?.length > 5
                                ? f.hora_apertura.slice(0, 5)
                                : f.hora_apertura ?? ''
                            }
                            onChange={(e) =>
                              actualizarFila(f.dia_semana, 'hora_apertura', e.target.value)
                            }
                            aria-label={`Apertura ${meta?.etiqueta}`}
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            className="mc-input"
                            value={
                              f.hora_cierre?.length > 5
                                ? f.hora_cierre.slice(0, 5)
                                : f.hora_cierre ?? ''
                            }
                            onChange={(e) =>
                              actualizarFila(f.dia_semana, 'hora_cierre', e.target.value)
                            }
                            aria-label={`Cierre ${meta?.etiqueta}`}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <Button
                type="button"
                variante="primario"
                onClick={guardarConfiguracion}
                cargando={guardando}
                disabled={!puedeGuardar}
              >
                Guardar configuración
              </Button>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--color-text-light)' }}>
            Elige una sala para editar sus horarios.
          </p>
        )}
      </div>
    </div>
  )
}

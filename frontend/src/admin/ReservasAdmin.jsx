import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getAdminReservas } from '../api/api'
import { Button } from '../components/Button'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { mensajeDesdeError } from '../utils/erroresApi'

export default function ReservasAdmin() {
  const { token } = useOutletContext()
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({
    estado_reserva: '',
    estado_pago: '',
    fecha_desde: '',
    fecha_hasta: '',
  })

  const cargar = useCallback(async () => {
    setError('')
    setCargando(true)
    try {
      const params = {}
      if (filtros.estado_reserva)
        params.estado_reserva = filtros.estado_reserva
      if (filtros.estado_pago) params.estado_pago = filtros.estado_pago
      if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde
      if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta

      const r = await getAdminReservas(token, params)
      setLista(r?.datos?.reservas ?? [])
    } catch (e) {
      setError(mensajeDesdeError(e))
      setLista([])
    } finally {
      setCargando(false)
    }
  }, [token, filtros])

  useEffect(() => {
    cargar()
  }, [cargar])

  function etiquetaPago(r) {
    if (!r.pago) return 'Sin pago'
    return `${r.pago.estado} · S/ ${r.pago.monto}`
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>Reservas</h1>
      {error ? (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <MensajeAlerta>{error}</MensajeAlerta>
        </div>
      ) : null}

      <div className="admin-toolbar admin-form-panel" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="mc-input-wrap">
          <label htmlFor="fr_estado_res">Estado reserva</label>
          <select
            id="fr_estado_res"
            className="mc-input"
            value={filtros.estado_reserva}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, estado_reserva: e.target.value }))
            }
          >
            <option value="">Todos</option>
            <option value="reservado">reservado</option>
          </select>
        </div>
        <div className="mc-input-wrap">
          <label htmlFor="fr_pago">Estado pago</label>
          <select
            id="fr_pago"
            className="mc-input"
            value={filtros.estado_pago}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, estado_pago: e.target.value }))
            }
          >
            <option value="">Todos</option>
            <option value="pagado">pagado</option>
            <option value="sin_pago">sin pago</option>
          </select>
        </div>
        <div className="mc-input-wrap">
          <label htmlFor="fr_fd">Desde</label>
          <input
            id="fr_fd"
            type="date"
            className="mc-input"
            value={filtros.fecha_desde}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, fecha_desde: e.target.value }))
            }
          />
        </div>
        <div className="mc-input-wrap">
          <label htmlFor="fr_fh">Hasta</label>
          <input
            id="fr_fh"
            type="date"
            className="mc-input"
            value={filtros.fecha_hasta}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, fecha_hasta: e.target.value }))
            }
          />
        </div>
        <Button type="button" variante="secundario" onClick={cargar}>
          Refrescar
        </Button>
      </div>

      {cargando ? (
        <p style={{ color: 'var(--color-text-light)' }}>Cargando…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Película</th>
                <th>Sala</th>
                <th>Fecha / hora</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((r) => (
                <tr key={r.id}>
                  <td>
                    <code style={{ fontSize: '0.8rem' }}>{r.codigo_reserva}</code>
                  </td>
                  <td>{r.pelicula?.titulo ?? '—'}</td>
                  <td>{r.sala ?? '—'}</td>
                  <td>
                    {r.fecha_funcion} {r.hora_funcion}
                  </td>
                  <td>
                    {r.usuario ? (
                      <>
                        {r.usuario.nombre}
                        <br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                          {r.usuario.correo}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.85rem' }}>
                        Invitado {r.guest_id ? `(${r.guest_id.slice(0, 12)}…)` : ''}
                      </span>
                    )}
                  </td>
                  <td>{r.estado_reserva}</td>
                  <td>{etiquetaPago(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

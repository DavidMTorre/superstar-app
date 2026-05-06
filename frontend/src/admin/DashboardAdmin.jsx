import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getDashboard } from '../api/api'
import { mensajeDesdeError } from '../utils/erroresApi'
import { MensajeAlerta } from '../components/MensajeAlerta'

function fmtSoles(n) {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function DashboardAdmin() {
  const { token } = useOutletContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      setError('')
      setLoading(true)
      try {
        const res = await getDashboard(token)
        if (!cancelado) setData(res?.datos ?? null)
      } catch (e) {
        if (!cancelado) setError(mensajeDesdeError(e))
      } finally {
        if (!cancelado) setLoading(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [token])

  if (loading && !data) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--color-text-light)' }}>Cargando métricas…</p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-md)' }}>Dashboard</h1>
      <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-xl)', maxWidth: '52ch' }}>
        Métricas consolidadas desde el servidor: entradas (precio de sala en la reserva), confitería por líneas
        directas vs combos, y tendencia diaria por fecha de creación de la reserva.
      </p>

      {error ? <MensajeAlerta>{error}</MensajeAlerta> : null}

      <div className="grid-kpi">
        <div className="admin-stat">
          <div className="admin-stat__label">Reservas</div>
          <div className="admin-stat__value">{data?.reservas_total ?? '—'}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Ingresos entradas (S/)</div>
          <div className="admin-stat__value">{fmtSoles(data?.ingresos_entradas)}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Confitería directa (S/)</div>
          <div className="admin-stat__value">{fmtSoles(data?.ingresos_confiteria)}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Ingresos combos (S/)</div>
          <div className="admin-stat__value">{fmtSoles(data?.ingresos_combos)}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Usuarios registrados</div>
          <div className="admin-stat__value">{data?.total_usuarios ?? '—'}</div>
        </div>
      </div>

      <div className="admin-form-panel" style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ margin: '0 0 var(--space-md)', fontSize: '1.1rem' }}>Productos más vendidos</h2>
        {!data?.productos_top?.length ? (
          <p style={{ margin: 0, color: 'var(--color-text-light)' }}>Aún no hay ventas de confitería registradas.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {data.productos_top.map((p) => (
              <li key={p.producto_id} style={{ marginBottom: '0.35rem' }}>
                <strong>{p.nombre}</strong> — {p.total} uds.
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="admin-form-panel">
        <h2 style={{ margin: '0 0 var(--space-md)', fontSize: '1.1rem' }}>Ventas por día (reservas)</h2>
        <p style={{ margin: '0 0 var(--space-md)', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
          Suma del campo <code>precio_total</code> de cada reserva, agrupada por día de creación.
        </p>
        {!data?.ventas_por_dia?.length ? (
          <p style={{ margin: 0, color: 'var(--color-text-light)' }}>Sin datos aún.</p>
        ) : (
          <div className="dashboard-ventas-dia">
            {data.ventas_por_dia.map((v) => (
              <div key={v.fecha} className="dashboard-ventas-dia__row">
                <span>{v.fecha}</span>
                <span>S/ {fmtSoles(v.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

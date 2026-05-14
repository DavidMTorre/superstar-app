import { formatSolesPe } from '../../utils/formatMoneda'

export function DashboardKpiGrid({ data }) {
  return (
    <div className="grid-kpi">
      <div className="admin-stat">
        <div className="admin-stat__label">Reservas</div>
        <div className="admin-stat__value">{data?.reservas_total ?? '—'}</div>
      </div>
      <div className="admin-stat">
        <div className="admin-stat__label">Ingresos entradas (S/)</div>
        <div className="admin-stat__value">{formatSolesPe(data?.ingresos_entradas)}</div>
      </div>
      <div className="admin-stat">
        <div className="admin-stat__label">Confitería directa (S/)</div>
        <div className="admin-stat__value">{formatSolesPe(data?.ingresos_confiteria)}</div>
      </div>
      <div className="admin-stat">
        <div className="admin-stat__label">Ingresos combos (S/)</div>
        <div className="admin-stat__value">{formatSolesPe(data?.ingresos_combos)}</div>
      </div>
      <div className="admin-stat">
        <div className="admin-stat__label">Usuarios registrados</div>
        <div className="admin-stat__value">{data?.total_usuarios ?? '—'}</div>
      </div>
    </div>
  )
}

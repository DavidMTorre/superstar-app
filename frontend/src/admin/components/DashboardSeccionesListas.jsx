import { formatSolesPe } from '../../utils/formatMoneda'

export function DashboardSeccionesListas({ data }) {
  return (
    <>
      <div className="admin-form-panel mb-[var(--space-xl)]">
        <h2 className="m-0 mb-[var(--space-md)] text-[1.1rem]">Productos más vendidos</h2>
        {!data?.productos_top?.length ? (
          <p className="m-0 text-[var(--color-text-light)]">Aún no hay ventas de confitería registradas.</p>
        ) : (
          <ul className="m-0 pl-5">
            {data.productos_top.map((p) => (
              <li key={p.producto_id} className="mb-[0.35rem]">
                <strong>{p.nombre}</strong> — {p.total} uds.
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="admin-form-panel">
        <h2 className="m-0 mb-[var(--space-md)] text-[1.1rem]">Ventas por día (reservas)</h2>
        <p className="mb-[var(--space-md)] mt-0 text-[0.9rem] text-[var(--color-text-light)]">
          Suma del campo <code>precio_total</code> de cada reserva, agrupada por día de creación.
        </p>
        {!data?.ventas_por_dia?.length ? (
          <p className="m-0 text-[var(--color-text-light)]">Sin datos aún.</p>
        ) : (
          <div className="dashboard-ventas-dia">
            {data.ventas_por_dia.map((v) => (
              <div key={v.fecha} className="dashboard-ventas-dia__row">
                <span>{v.fecha}</span>
                <span>S/ {formatSolesPe(v.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

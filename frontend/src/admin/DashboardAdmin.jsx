import { useOutletContext } from 'react-router-dom'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { useDashboardAdmin } from '../hooks/useDashboardAdmin'
import { DashboardKpiGrid } from './components/DashboardKpiGrid'
import { DashboardSeccionesListas } from './components/DashboardSeccionesListas'

export default function DashboardAdmin() {
  const { token } = useOutletContext()
  const { data, loading, error } = useDashboardAdmin(token)

  if (loading && !data) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p className="text-[var(--color-text-light)]">Cargando métricas…</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-[var(--space-md)]">Dashboard</h1>
      <p className="mb-[var(--space-xl)] max-w-[52ch] text-[var(--color-text-light)]">
        Métricas consolidadas desde el servidor: entradas (precio de sala en la reserva), confitería por líneas
        directas vs combos, y tendencia diaria por fecha de creación de la reserva.
      </p>

      {error ? <MensajeAlerta>{error}</MensajeAlerta> : null}

      <DashboardKpiGrid data={data} />
      <DashboardSeccionesListas data={data} />
    </div>
  )
}

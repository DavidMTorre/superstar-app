import { useParams } from 'react-router-dom'
import { Cargando } from '../components/Cargando'
import { TicketEstadoError, TicketTarjetaPremium } from '../components/ticket/TicketVista'
import { useTicketCarga } from '../hooks/useTicketCarga'

export default function TicketPage() {
  const { token: tokenParam } = useParams()
  const { cargando, error, ticket } = useTicketCarga(tokenParam)

  if (cargando) {
    return <Cargando mensaje="Cargando tu entrada…" />
  }

  if (error || !ticket) {
    return <TicketEstadoError mensaje={error || 'Ticket no disponible.'} />
  }

  return <TicketTarjetaPremium ticket={ticket} />
}

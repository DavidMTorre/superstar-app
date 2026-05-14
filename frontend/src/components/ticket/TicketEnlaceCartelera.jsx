import { Link } from 'react-router-dom'

const CLASE_ENLACE =
  'text-sm font-medium text-[var(--color-primary-light)] hover:text-[var(--color-primary)]'

/** Enlace de retorno a cartelera (misma apariencia en error y vista ticket). */
export function TicketEnlaceCartelera({ modo = 'default' }) {
  const etiqueta = modo === 'volver' ? '← Volver a cartelera' : '← Cartelera'
  return (
    <p className="mb-4">
      <Link to="/cartelera" className={CLASE_ENLACE}>
        {etiqueta}
      </Link>
    </p>
  )
}

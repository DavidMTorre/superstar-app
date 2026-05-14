import { MensajeAlerta } from '../MensajeAlerta'

export function CarteleraErrorInicial({ mensaje }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)]/80 p-6 backdrop-blur-md">
      <MensajeAlerta>{mensaje}</MensajeAlerta>
      <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
        Comprueba que el servidor Laravel esté en ejecución y la URL en{' '}
        <code className="rounded bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-[var(--color-primary-light)]">
          .env
        </code>{' '}
        (VITE_API_URL) o el proxy de Vite.
      </p>
    </div>
  )
}

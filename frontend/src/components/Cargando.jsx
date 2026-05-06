export function Cargando({ mensaje = 'Cargando…' }) {
  return (
    <div className="mc-centrado" role="status" aria-live="polite">
      <div style={{ textAlign: 'center' }}>
        <div className="mc-spinner" aria-hidden />
        <p style={{ marginTop: 'var(--space-md)', color: 'var(--color-text-light)' }}>
          {mensaje}
        </p>
      </div>
    </div>
  )
}

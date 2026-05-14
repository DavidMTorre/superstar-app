import { Button } from '../Button'

/** Barra fija móvil con resumen y envío al formulario (id fijo). */
export function ReservaDockMovil({
  visible,
  tituloPelicula,
  fecha,
  horarioSeleccionado,
  puedeEnviar,
  enviando,
}) {
  if (!visible) return null

  return (
    <div
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] left-3 right-3 z-30 rounded-2xl border border-[rgba(255,122,0,0.4)] bg-[rgba(11,11,15,0.88)] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl md:hidden"
      role="status"
      aria-live="polite"
    >
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-gold)]">
        Resumen rápido
      </p>
      <p className="mb-3 line-clamp-2 text-sm font-semibold text-[var(--color-text)]">{tituloPelicula}</p>
      <p className="mb-3 text-xs text-[var(--color-text-muted)]">
        {fecha} · {horarioSeleccionado.hora_inicio} – {horarioSeleccionado.hora_fin} ·{' '}
        <span className="font-bold text-[var(--color-primary-light)]">
          S/ {Number(horarioSeleccionado.precio).toFixed(2)}
        </span>
      </p>
      <Button
        type="submit"
        form="formulario-reserva"
        variante="primario"
        anchoCompleto
        cargando={enviando}
        disabled={!puedeEnviar}
      >
        Confirmar reserva
      </Button>
    </div>
  )
}

/**
 * Botón reutilizable con variantes y estado de carga.
 */
export function Button({
  children,
  tipo = 'button',
  variante = 'primario',
  cargando = false,
  anchoCompleto = false,
  className = '',
  disabled,
  ...props
}) {
  const clases = [
    'mc-btn',
    variante === 'primario' && 'mc-btn--primario',
    variante === 'secundario' && 'mc-btn--secundario',
    variante === 'opcion' && 'mc-btn--opcion',
    anchoCompleto && 'mc-btn--ancho-completo',
    (className || '').trim(),
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={tipo}
      className={clases}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando ? 'Cargando…' : children}
    </button>
  )
}

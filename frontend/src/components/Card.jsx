/**
 * Tarjeta contenedora; opción interactiva con hover animado.
 */
export function Card({
  children,
  interactiva = false,
  className = '',
  ...props
}) {
  const clases = [
    'mc-card',
    interactiva && 'mc-card--interactiva',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={clases} {...props}>
      {children}
    </article>
  )
}

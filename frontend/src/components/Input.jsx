/**
 * Campo de formulario con etiqueta accesible.
 */
export function Input({
  etiqueta,
  id,
  tipo = 'text',
  error,
  className = '',
  inputClassName = '',
  ...props
}) {
  const idFinal = id || props.name
  const clasesInput = ['mc-input', (inputClassName || '').trim()].filter(Boolean).join(' ')

  return (
    <div className={`mc-input-wrap ${className}`.trim()}>
      {etiqueta ? (
        <label htmlFor={idFinal}>{etiqueta}</label>
      ) : null}
      <input
        id={idFinal}
        type={tipo}
        className={clasesInput}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
      {error ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>
          {error}
        </span>
      ) : null}
    </div>
  )
}

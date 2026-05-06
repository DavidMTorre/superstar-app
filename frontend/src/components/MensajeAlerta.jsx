export function MensajeAlerta({ tipo = 'error', children }) {
  const clase =
    tipo === 'exito' ? 'mc-alerta mc-alerta--exito' : 'mc-alerta mc-alerta--error'
  return (
    <div className={clase} role="alert">
      {children}
    </div>
  )
}

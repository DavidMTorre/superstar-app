import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { pagar } from '../api/api'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { mensajeDesdeError } from '../utils/erroresApi'

const METODOS = [
  { id: 'yape', etiqueta: 'Yape' },
  { id: 'plin', etiqueta: 'Plin' },
  { id: 'tarjeta', etiqueta: 'Tarjeta' },
  { id: 'efectivo', etiqueta: 'Efectivo' },
]

export default function PagoPage() {
  const ubicacion = useLocation()
  const navegar = useNavigate()

  const codigoInicial = ubicacion.state?.codigoReserva || ''
  const resumen = ubicacion.state?.resumen
  const subtotalConfiteriaState = Number(ubicacion.state?.subtotalConfiteria ?? 0)
  const totalPagarState =
    ubicacion.state?.totalPagar != null && ubicacion.state.totalPagar !== ''
      ? Number(ubicacion.state.totalPagar)
      : null

  const precioEntrada =
    resumen?.precio_total != null && resumen.precio_total !== ''
      ? Number(resumen.precio_total)
      : 0
  const totalCalculado =
    totalPagarState != null && !Number.isNaN(totalPagarState)
      ? totalPagarState
      : precioEntrada + subtotalConfiteriaState

  const [codigoReserva, setCodigoReserva] = useState(codigoInicial)
  const [metodoPago, setMetodoPago] = useState('yape')
  const [monto, setMonto] = useState(() =>
    totalCalculado > 0 ? String(totalCalculado.toFixed(2)) : ''
  )
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(null)

  useEffect(() => {
    const sub = Number(ubicacion.state?.subtotalConfiteria ?? 0)
    const totalLoc =
      ubicacion.state?.totalPagar != null && ubicacion.state.totalPagar !== ''
        ? Number(ubicacion.state.totalPagar)
        : null
    const entrada =
      resumen?.precio_total != null && resumen.precio_total !== ''
        ? Number(resumen.precio_total)
        : 0
    const t =
      totalLoc != null && !Number.isNaN(totalLoc) ? totalLoc : entrada + sub
    if (t > 0) {
      setMonto(String(t.toFixed(2)))
    }
  }, [resumen, ubicacion.state])

  async function manejarPago(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    setExito(null)

    try {
      const respuesta = await pagar({
        codigo_reserva: codigoReserva.trim(),
        metodo_pago: metodoPago,
        monto: Number(monto),
      })
      setExito(respuesta)
    } catch (err) {
      setError(mensajeDesdeError(err))
    } finally {
      setCargando(false)
    }
  }

  if (exito?.exito && exito?.datos) {
    const qr = exito.datos.ticket?.codigo_qr
    return (
      <div style={{ paddingTop: 'var(--space-lg)', maxWidth: '520px', margin: '0 auto' }}>
        <div className="mc-form-panel">
          <h1 style={{ color: 'var(--color-success)' }}>Pago confirmado</h1>
          <MensajeAlerta tipo="exito">
            Tu entrada está lista. Guarda el código QR para el acceso a sala.
          </MensajeAlerta>
          {qr ? (
            <div
              style={{
                padding: 'var(--space-md)',
                background: 'rgba(40, 199, 111, 0.08)',
                borderRadius: 'var(--radius-md)',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                marginBottom: 'var(--space-lg)',
              }}
            >
              <strong>Código ticket (QR):</strong>
              <br />
              {qr}
            </div>
          ) : null}
          <Button
            type="button"
            variante="primario"
            anchoCompleto
            onClick={() => navegar('/cartelera')}
          >
            Volver a cartelera
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 'var(--space-lg)' }}>
      <p style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/cartelera">← Inicio</Link>
      </p>
      <div className="mc-form-panel">
        <h1 style={{ marginBottom: 'var(--space-sm)' }}>Pagar reserva</h1>
        {resumen ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
            {(resumen.pelicula_titulo || resumen.pelicula?.titulo) ? (
              <>
                <strong>{resumen.pelicula_titulo || resumen.pelicula?.titulo}</strong>
                {' · '}
              </>
            ) : null}
            {resumen.sala ? (
              <>
                Sala <strong>{resumen.sala}</strong>
                {' · '}
              </>
            ) : null}
            Función: {resumen.fecha_funcion} · inicio {resumen.hora_funcion}
            {resumen.hora_fin_display ? (
              <>
                {' '}
                · fin {resumen.hora_fin_display}
              </>
            ) : null}{' '}
            · {resumen.cantidad_personas} persona(s)
          </p>
        ) : null}
        {resumen?.precio_total != null ? (
          <div
            style={{
              fontSize: '0.95rem',
              marginBottom: 'var(--space-md)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0,0,0,0.04)',
            }}
          >
            <p style={{ margin: '0 0 0.35rem' }}>
              Precio entrada:{' '}
              <strong>S/ {Number(resumen.precio_total).toFixed(2)}</strong>
            </p>
            <p style={{ margin: '0 0 0.35rem' }}>
              Confitería:{' '}
              <strong>S/ {Number(subtotalConfiteriaState).toFixed(2)}</strong>
            </p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '1.05rem', fontWeight: 700 }}>
              Total a pagar: <strong>S/ {Number(totalCalculado).toFixed(2)}</strong>
            </p>
          </div>
        ) : null}

        {error ? <MensajeAlerta>{error}</MensajeAlerta> : null}

        <form onSubmit={manejarPago}>
          <Input
            etiqueta="Código de reserva (UUID)"
            name="codigo_reserva"
            value={codigoReserva}
            onChange={(e) => setCodigoReserva(e.target.value)}
            required
            placeholder="Pega el código si no viene de la reserva"
          />

          <p style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
            Método de pago
          </p>
          <div className="mc-flex-metodos" role="group" aria-label="Método de pago">
            {METODOS.map((m) => (
              <Button
                key={m.id}
                type="button"
                variante="opcion"
                className={metodoPago === m.id ? 'mc-btn--activo' : ''}
                onClick={() => setMetodoPago(m.id)}
              >
                {m.etiqueta}
              </Button>
            ))}
          </div>

          <Input
            etiqueta="Monto (S/)"
            name="monto"
            type="number"
            step="0.01"
            min="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />

          <Button type="submit" variante="primario" anchoCompleto cargando={cargando}>
            Confirmar pago
          </Button>
        </form>
      </div>
    </div>
  )
}

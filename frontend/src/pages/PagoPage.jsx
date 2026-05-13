import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, CreditCard } from 'lucide-react'
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
    const qrImg = exito.datos.ticket?.qr_imagen
    return (
      <div className="mx-auto max-w-lg pb-8 pt-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mc-form-panel !max-w-none border border-[rgba(40,199,111,0.35)] bg-[var(--color-card)]/95 text-center shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-md"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(40,199,111,0.2)] text-[var(--color-success)]">
            <CheckCircle2 className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mb-2 text-2xl font-extrabold text-[var(--color-success)]">Pago confirmado</h1>
          <MensajeAlerta tipo="exito">
            Tu entrada está lista. Guarda el código QR para el acceso a sala.
          </MensajeAlerta>
          {qrImg ? (
            <div className="mb-6 mt-6">
              <p className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold text-[var(--color-text-light)]">
                <CreditCard className="h-4 w-4 text-[var(--color-accent-gold)]" aria-hidden />
                Tu código QR de ingreso
              </p>
              <motion.img
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                src={qrImg}
                alt="Código QR del ticket"
                className="mx-auto w-[min(280px,85vw)] rounded-2xl border border-[rgba(255,122,0,0.35)] shadow-[0_0_40px_rgba(255,122,0,0.15)]"
              />
            </div>
          ) : null}
          {exito.datos.ticket?.token_qr ? (
            <p className="mb-6">
              <Link
                to={`/ticket/${encodeURIComponent(exito.datos.ticket.token_qr)}`}
                className="text-sm font-bold text-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
              >
                Ver ticket completo
              </Link>
            </p>
          ) : null}
          <Button
            type="button"
            variante="primario"
            anchoCompleto
            onClick={() => navegar('/cartelera')}
          >
            Volver a cartelera
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg pb-8 pt-2">
      <p className="mb-4">
        <Link
          to="/cartelera"
          className="text-sm font-medium text-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
        >
          ← Inicio
        </Link>
      </p>
      <div className="mc-form-panel border border-[var(--color-border-subtle)] bg-[var(--color-card)]/95 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(255,122,0,0.15)] text-[var(--color-primary-light)]">
            <CreditCard className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="mb-0 text-xl font-extrabold tracking-tight">Pagar reserva</h1>
            <p className="mb-0 mt-0.5 text-xs text-[var(--color-text-muted)]">Completa el pago de tu función</p>
          </div>
        </div>
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
          <div className="mb-6 rounded-xl border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.03)] p-4 text-sm">
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

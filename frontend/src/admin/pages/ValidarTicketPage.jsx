import { useCallback, useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useOutletContext } from 'react-router-dom'
import { validarTicket } from '../../api/api'
import { extraerTokenDesdeTextoEscaneado } from '../../utils/ticketToken'

export default function ValidarTicketPage() {
  const { token } = useOutletContext() ?? {}
  const regionId = 'mc-validar-qr-region'
  const escanerRef = useRef(null)
  const procesandoRef = useRef(false)
  const procesarTokenRef = useRef(async () => {})

  const [escaneando, setEscaneando] = useState(false)
  const [errorCamara, setErrorCamara] = useState('')
  const [tokenManual, setTokenManual] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)

  const procesarToken = useCallback(
    async (tokenQrRaw) => {
      const tokenQr = extraerTokenDesdeTextoEscaneado(tokenQrRaw)
      if (!tokenQr) {
        setResultado({ tipo: 'invalido', mensaje: 'No se pudo leer el código.' })
        return
      }

      if (!token || typeof token !== 'string') {
        setResultado({ tipo: 'invalido', mensaje: 'Sesión de administrador no disponible.' })
        return
      }

      if (procesandoRef.current) return
      procesandoRef.current = true

      setEnviando(true)
      setResultado(null)

      try {
        const resp = await validarTicket(token, tokenQr)
        if (resp?.exito) {
          setResultado({
            tipo: 'ok',
            mensaje: resp.mensaje || 'Acceso autorizado',
            datos: resp.datos ?? null,
          })
        } else {
          const m = resp?.mensaje || 'Error'
          if (m.toLowerCase().includes('ya utilizado')) {
            setResultado({ tipo: 'usado', mensaje: m })
          } else if (m.toLowerCase().includes('finaliz')) {
            setResultado({ tipo: 'expirado', mensaje: m })
          } else {
            setResultado({ tipo: 'invalido', mensaje: m })
          }
        }
      } catch (err) {
        const m = err?.cuerpo?.mensaje || err?.message || 'Error de red'
        setResultado({ tipo: 'invalido', mensaje: m })
      } finally {
        setEnviando(false)
        procesandoRef.current = false
      }
    },
    [token],
  )

  useEffect(() => {
    procesarTokenRef.current = procesarToken
  }, [procesarToken])

  useEffect(() => {
    let activo = true

    async function iniciar() {
      setErrorCamara('')
      setEscaneando(false)

      try {
        const escaner = new Html5Qrcode(regionId)
        escanerRef.current = escaner

        await escaner.start(
          { facingMode: 'environment' },
          { fps: 8, qrbox: { width: 260, height: 260 } },
          (decodedText) => {
            void procesarTokenRef.current(decodedText)
          },
          () => {},
        )

        if (activo) {
          setEscaneando(true)
        }
      } catch {
        if (activo) {
          setErrorCamara(
            'No se pudo usar la cámara. Comprueba permisos o ingresa el token manualmente.',
          )
        }
      }
    }

    void iniciar()

    return () => {
      activo = false
      const e = escanerRef.current
      escanerRef.current = null
      if (e) {
        e.stop()
          .catch(() => {})
          .finally(() => {
            try {
              e.clear()
            } catch {
              /* ignorar */
            }
          })
      }
    }
  }, [])

  async function enviarManual(e) {
    e.preventDefault()
    await procesarToken(tokenManual)
    setTokenManual('')
  }

  const fondoResultado =
    resultado?.tipo === 'ok'
      ? 'rgba(40, 199, 111, 0.15)'
      : resultado?.tipo === 'usado'
        ? 'rgba(245, 191, 71, 0.2)'
        : resultado?.tipo === 'expirado'
          ? 'rgba(245, 191, 71, 0.15)'
          : resultado
            ? 'rgba(229, 62, 62, 0.12)'
            : 'transparent'

  return (
    <div style={{ maxWidth: '560px' }}>
      <h1 style={{ marginBottom: 'var(--space-sm)' }}>Validar entrada (QR)</h1>
      <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-lg)', fontSize: '0.95rem' }}>
        Escanea el código del cliente; la decisión de acceso la toma siempre el servidor.
      </p>

      <div
        id={regionId}
        style={{
          width: '100%',
          minHeight: '260px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: '#0f0f12',
          marginBottom: 'var(--space-md)',
        }}
      />

      {escaneando ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: 'var(--space-md)' }}>
          Cámara activa. Apunta al QR del ticket.
        </p>
      ) : null}

      {errorCamara ? (
        <p style={{ fontSize: '0.88rem', color: 'var(--color-danger)', marginBottom: 'var(--space-md)' }}>
          {errorCamara}
        </p>
      ) : null}

      <form onSubmit={enviarManual} style={{ marginBottom: 'var(--space-xl)' }}>
        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>
          Token manual (alternativa)
        </label>
        <textarea
          className="mc-input"
          rows={3}
          placeholder="Pega URL completa o solo el token"
          value={tokenManual}
          onChange={(e) => setTokenManual(e.target.value)}
          style={{ width: '100%', resize: 'vertical', marginBottom: 'var(--space-sm)' }}
        />
        <button type="submit" className="mc-btn mc-btn--primario" disabled={enviando}>
          {enviando ? 'Validando…' : 'Validar token'}
        </button>
      </form>

      {resultado ? (
        <div
          role="status"
          style={{
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-md)',
            background: fondoResultado,
            border: '1px solid rgba(31,31,31,0.1)',
          }}
        >
          {resultado.tipo === 'ok' ? (
            <>
              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)' }}>
                ✅ ACCESO AUTORIZADO
              </p>
              {resultado.datos ? (
                <ul style={{ margin: 'var(--space-md) 0 0', paddingLeft: '1.2rem', fontSize: '0.95rem' }}>
                  <li>Película: {resultado.datos.pelicula}</li>
                  <li>Sala: {resultado.datos.sala}</li>
                  <li>Hora: {resultado.datos.hora}</li>
                  <li>Cliente: {resultado.datos.cliente}</li>
                </ul>
              ) : null}
            </>
          ) : null}

          {resultado.tipo === 'invalido' ? (
            <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#c0392b' }}>
              ❌ TICKET INVÁLIDO
            </p>
          ) : null}

          {resultado.tipo === 'usado' ? (
            <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#b7791f' }}>
              ⚠ TICKET YA UTILIZADO
            </p>
          ) : null}

          {resultado.tipo === 'expirado' ? (
            <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#b7791f' }}>
              ⚠ FUNCIÓN FINALIZADA
            </p>
          ) : null}

          <p style={{ margin: 'var(--space-sm) 0 0', fontSize: '0.9rem' }}>{resultado.mensaje}</p>
        </div>
      ) : null}
    </div>
  )
}

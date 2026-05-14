import { useEffect, useMemo, useState } from 'react'
import { getTicket } from '../api/api'
import { extraerTokenDesdeTextoEscaneado } from '../utils/ticketToken'
import { mensajeDesdeError } from '../utils/erroresApi'

/**
 * Carga ticket por token de ruta; misma lógica que la página original.
 * @param {string | undefined} tokenParam Valor crudo de useParams().token
 */
export function useTicketCarga(tokenParam) {
  const tokenRuta = useMemo(
    () => extraerTokenDesdeTextoEscaneado(tokenParam),
    [tokenParam],
  )

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ticket, setTicket] = useState(null)

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      setCargando(true)
      setError('')
      setTicket(null)

      if (!tokenRuta) {
        setError('Enlace de ticket no válido.')
        setCargando(false)
        return
      }

      try {
        const resp = await getTicket(tokenRuta)
        if (cancelado) return

        if (!resp?.exito || !resp?.datos) {
          setError(resp?.mensaje || 'No se pudo cargar el ticket.')
          return
        }

        setTicket(resp.datos)
      } catch (err) {
        if (!cancelado) {
          setError(mensajeDesdeError(err))
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    void cargar()

    return () => {
      cancelado = true
    }
  }, [tokenRuta])

  return { cargando, error, ticket, tokenRuta }
}

import { useEffect, useState } from 'react'
import { getDashboard } from '../api/api'
import { mensajeDesdeError } from '../utils/erroresApi'

export function useDashboardAdmin(token) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      setError('')
      setLoading(true)
      try {
        const res = await getDashboard(token)
        if (!cancelado) setData(res?.datos ?? null)
      } catch (e) {
        if (!cancelado) setError(mensajeDesdeError(e))
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    void cargar()

    return () => {
      cancelado = true
    }
  }, [token])

  return { data, loading, error }
}

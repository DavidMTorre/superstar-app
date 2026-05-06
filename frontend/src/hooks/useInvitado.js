import { useCallback, useState } from 'react'
import { crearSesionInvitado } from '../api/api'

const CLAVE_GUEST = 'minicine_guest_id'

function leerGuestId() {
  return localStorage.getItem(CLAVE_GUEST)
}

/**
 * Mantiene guest_id para reservas cuando no hay usuario registrado.
 */
export function useInvitado() {
  const [guestId, setGuestId] = useState(() => leerGuestId())

  const asegurarGuestId = useCallback(async () => {
    let id = leerGuestId()
    if (id) {
      setGuestId(id)
      return id
    }
    const respuesta = await crearSesionInvitado()
    id = respuesta?.datos?.guest_id
    if (!id) throw new Error('No se pudo crear sesión de invitado.')
    localStorage.setItem(CLAVE_GUEST, id)
    setGuestId(id)
    return id
  }, [])

  return {
    guestId,
    asegurarGuestId,
  }
}

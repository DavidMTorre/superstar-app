import { useCallback, useState } from 'react'

const CLAVE_LEGACY = 'minicine_usuario'
const CLAVE_SESION = 'minicine_sesion'

/**
 * Comprueba que el objeto guardado tenga la forma mínima esperada del API.
 * Evita usar datos corruptos o manipulados de forma grosera.
 */
export function esPerfilUsuarioValido(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return false

  const id = datos.id
  if (id === null || id === undefined) return false
  const idNum = Number(id)
  if (!Number.isFinite(idNum) || idNum < 1) return false

  if (typeof datos.correo !== 'string' || datos.correo.trim() === '') return false
  if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') return false

  return true
}

function leerSesionDesdeAlmacenamiento() {
  try {
    try {
      localStorage.removeItem(CLAVE_LEGACY)
    } catch {
      /* ignorar */
    }

    const raw = localStorage.getItem(CLAVE_SESION)
    if (raw === null || String(raw).trim() === '') {
      return null
    }
    const datos = JSON.parse(raw)
    if (
      datos &&
      typeof datos === 'object' &&
      esPerfilUsuarioValido(datos.usuario) &&
      typeof datos.token === 'string' &&
      datos.token.trim() !== ''
    ) {
      return { usuario: datos.usuario, token: datos.token.trim() }
    }
    localStorage.removeItem(CLAVE_SESION)
  } catch {
    try {
      localStorage.removeItem(CLAVE_SESION)
    } catch {
      /* ignorar */
    }
  }
  return null
}

/**
 * Sesión: usuario + token Sanctum (`POST /api/v1/auth/login`).
 */
export function useSesionUsuario() {
  const inicial = leerSesionDesdeAlmacenamiento()
  const [usuario, setUsuario] = useState(() => inicial?.usuario ?? null)
  const [token, setToken] = useState(() => inicial?.token ?? null)

  const iniciarSesion = useCallback(({ usuario: datosUsuario, token: tokenAcceso }) => {
    if (!esPerfilUsuarioValido(datosUsuario)) {
      return
    }
    const tok =
      typeof tokenAcceso === 'string' && tokenAcceso.trim() !== ''
        ? tokenAcceso.trim()
        : null
    try {
      localStorage.removeItem(CLAVE_LEGACY)
      if (tok) {
        localStorage.setItem(
          CLAVE_SESION,
          JSON.stringify({ usuario: datosUsuario, token: tok }),
        )
      } else {
        localStorage.setItem(
          CLAVE_SESION,
          JSON.stringify({ usuario: datosUsuario, token: '' }),
        )
      }
      setUsuario(datosUsuario)
      setToken(tok)
    } catch {
      setUsuario(null)
      setToken(null)
    }
  }, [])

  const cerrarSesion = useCallback(() => {
    try {
      localStorage.removeItem(CLAVE_LEGACY)
      localStorage.removeItem(CLAVE_SESION)
    } catch {
      /* ignorar */
    }
    setUsuario(null)
    setToken(null)
  }, [])

  const esAdmin = usuario?.rol === 'admin'

  const estaAutenticado = Boolean(
    usuario && esPerfilUsuarioValido(usuario) && token,
  )

  return {
    usuario,
    token,
    iniciarSesion,
    cerrarSesion,
    estaAutenticado,
    esAdmin,
  }
}

/**
 * Cliente HTTP para la API MiniCine Superstar (Laravel).
 * Base URL: variable VITE_API_URL o rutas relativas /api con proxy de Vite.
 */

export function obtenerBaseUrl() {
  const env = import.meta.env.VITE_API_URL
  if (env && String(env).trim() !== '') {
    return String(env).replace(/\/$/, '')
  }
  return ''
}

async function solicitud(ruta, opciones = {}) {
  const base = obtenerBaseUrl()
  const url = base ? `${base}${ruta}` : ruta

  const cabeceras = {
    Accept: 'application/json',
    ...(opciones.body && !(opciones.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...opciones.headers,
  }

  const respuesta = await fetch(url, {
    ...opciones,
    headers: cabeceras,
  })

  let cuerpo = null
  const texto = await respuesta.text()
  if (texto) {
    try {
      cuerpo = JSON.parse(texto)
    } catch {
      cuerpo = { mensaje: texto }
    }
  }

  if (!respuesta.ok) {
    const error = new Error(cuerpo?.mensaje || `Error HTTP ${respuesta.status}`)
    error.status = respuesta.status
    error.cuerpo = cuerpo
    throw error
  }

  return cuerpo
}

/**
 * Petición autenticada con Bearer Sanctum.
 * @param {string} ruta
 * @param {string} token
 * @param {RequestInit} [opciones]
 */
export async function solicitudAutenticada(ruta, token, opciones = {}) {
  return solicitud(ruta, {
    ...opciones,
    headers: {
      ...opciones.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

/** @param {string} token */
export async function getAdminEstadisticas(token) {
  return solicitudAutenticada('/api/v1/admin/estadisticas', token, {
    method: 'GET',
  })
}

/** Resumen del panel: reservas, ingresos, confitería, combos, top productos, ventas por día. */
export async function getDashboard(token) {
  return solicitudAutenticada('/api/v1/admin/dashboard', token, {
    method: 'GET',
  })
}

/** @param {string} token */
export async function getAdminPeliculas(token) {
  return solicitudAutenticada('/api/v1/admin/peliculas', token, {
    method: 'GET',
  })
}

/**
 * @param {string} token
 * @param {object} cuerpo
 */
export async function postAdminPelicula(token, cuerpo) {
  return solicitudAutenticada('/api/v1/admin/peliculas', token, {
    method: 'POST',
    body: JSON.stringify(cuerpo),
  })
}

/**
 * @param {string} token
 * @param {number|string} id
 * @param {object} cuerpo
 */
export async function putAdminPelicula(token, id, cuerpo) {
  return solicitudAutenticada(`/api/v1/admin/peliculas/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(cuerpo),
  })
}

/**
 * @param {string} token
 * @param {number|string} id
 */
export async function deleteAdminPelicula(token, id) {
  return solicitudAutenticada(`/api/v1/admin/peliculas/${id}`, token, {
    method: 'DELETE',
  })
}

/**
 * @param {string} token
 * @param {Record<string, string>} [params] — estado_reserva, estado_pago, fecha_desde, fecha_hasta
 */
export async function getAdminReservas(token, params = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      q.set(k, String(v))
    }
  })
  const sufijo = q.toString() ? `?${q.toString()}` : ''
  return solicitudAutenticada(`/api/v1/admin/reservas${sufijo}`, token, {
    method: 'GET',
  })
}

/** @param {string} token */
export async function getAdminUsuarios(token) {
  return solicitudAutenticada('/api/v1/admin/usuarios', token, {
    method: 'GET',
  })
}

/**
 * @param {string} token
 * @param {number|string} id
 * @param {'cliente'|'admin'} rol
 */
export async function putAdminUsuarioRol(token, id, rol) {
  return solicitudAutenticada(`/api/v1/admin/usuarios/${id}/rol`, token, {
    method: 'PUT',
    body: JSON.stringify({ rol }),
  })
}

/** @param {string} token */
export async function getAdminSalas(token) {
  return solicitudAutenticada('/api/v1/admin/salas', token, { method: 'GET' })
}

/**
 * @param {string} token
 * @param {{ nombre: string, estado?: string }} cuerpo
 */
export async function postAdminSala(token, cuerpo) {
  return solicitudAutenticada('/api/v1/admin/salas', token, {
    method: 'POST',
    body: JSON.stringify(cuerpo),
  })
}

/**
 * @param {string} token
 * @param {number|string} id
 * @param {{ nombre: string, estado: string }} cuerpo
 */
export async function putAdminSala(token, id, cuerpo) {
  return solicitudAutenticada(`/api/v1/admin/salas/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(cuerpo),
  })
}

/**
 * @param {string} token
 * @param {number|string} id
 * @param {'disponible'|'inactiva'} estado
 */
export async function patchAdminSalaEstado(token, id, estado) {
  return solicitudAutenticada(`/api/v1/admin/salas/${id}/estado`, token, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  })
}

/** @param {string} token */
export async function getAdminSalaHorarios(token, salaId) {
  return solicitudAutenticada(`/api/v1/admin/salas/${salaId}/horarios`, token, {
    method: 'GET',
  })
}

/**
 * @param {string} token
 * @param {{ dia_semana: number, hora_apertura: string, hora_cierre: string }} cuerpo
 */
export async function postAdminSalaHorario(token, salaId, cuerpo) {
  return solicitudAutenticada(`/api/v1/admin/salas/${salaId}/horarios`, token, {
    method: 'POST',
    body: JSON.stringify(cuerpo),
  })
}

/**
 * @param {string} token
 * @param {{ hora_apertura: string, hora_cierre: string }} cuerpo
 */
export async function putAdminSalaHorario(token, salaId, horarioId, cuerpo) {
  return solicitudAutenticada(
    `/api/v1/admin/salas/${salaId}/horarios/${horarioId}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify(cuerpo),
    }
  )
}

/** @param {string} token */
export async function deleteAdminSalaHorario(token, salaId, horarioId) {
  return solicitudAutenticada(
    `/api/v1/admin/salas/${salaId}/horarios/${horarioId}`,
    token,
    {
      method: 'DELETE',
    }
  )
}

/** @param {string} token */
export async function getAdminProductosConfiteria(token) {
  return solicitudAutenticada('/api/v1/admin/confiteria/productos', token, {
    method: 'GET',
  })
}

/**
 * @param {string} token
 * @param {object} data
 */
export async function crearProductoConfiteria(token, data) {
  return solicitudAutenticada('/api/v1/admin/confiteria/productos', token, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * @param {string} token
 * @param {number|string} id
 * @param {object} data
 */
export async function actualizarProductoConfiteria(token, id, data) {
  return solicitudAutenticada(`/api/v1/admin/confiteria/productos/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** @param {string} token @param {number|string} id */
export async function eliminarProductoConfiteria(token, id) {
  return solicitudAutenticada(`/api/v1/admin/confiteria/productos/${id}`, token, {
    method: 'DELETE',
  })
}

/**
 * @param {string} token
 * @param {number|string} id
 * @param {'disponible'|'agotado'} estado
 */
export async function cambiarEstadoProductoConfiteria(token, id, estado) {
  return solicitudAutenticada(
    `/api/v1/admin/confiteria/productos/${id}/estado`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }
  )
}

/** @param {string} token */
export async function getAdminCombos(token) {
  return solicitudAutenticada('/api/v1/admin/combos', token, { method: 'GET' })
}

/**
 * @param {string} token
 * @param {{ nombre: string, precio: number, estado?: string, productos: Array<{ producto_id: number, cantidad: number }> }} data
 */
export async function crearComboConfiteria(token, data) {
  return solicitudAutenticada('/api/v1/admin/combos', token, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * @param {string} token
 * @param {number|string} id
 * @param {object} data
 */
export async function actualizarComboConfiteria(token, id, data) {
  return solicitudAutenticada(`/api/v1/admin/combos/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** @param {string} token @param {number|string} id */
export async function eliminarComboConfiteria(token, id) {
  return solicitudAutenticada(`/api/v1/admin/combos/${id}`, token, {
    method: 'DELETE',
  })
}

/** @param {{ correo: string, contraseña: string }} credenciales */
export async function login(credenciales) {
  return solicitud('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      correo: credenciales.correo,
      contraseña: credenciales.contraseña,
    }),
  })
}

/**
 * Registro de usuario (API devuelve 201 con `datos.usuario`).
 * @param {object} datos — nombre, correo, contraseña, telefono, fecha_nacimiento, genero
 */
export async function registro(datos) {
  return solicitud('/api/v1/auth/registro', {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

/**
 * Cartelera: sin params devuelve `datos.por_categoria`; con `buscar` y/o `categoria` devuelve `datos` como array de películas.
 * @param {Record<string, string|number|undefined|null>} [params]
 */
export async function getPeliculas(params = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      q.set(k, String(v).trim())
    }
  })
  const sufijo = q.toString() ? `?${q.toString()}` : ''
  return solicitud(`/api/v1/peliculas${sufijo}`, { method: 'GET' })
}

/** Listado público de salas disponibles (precio y tiempo de limpieza). */
export async function getSalasDisponibles() {
  return solicitud('/api/v1/salas', { method: 'GET' })
}

/**
 * Franjas reservables calculadas en el servidor (película + limpieza + cruces).
 * @param {number|string} peliculaId
 * @param {string} fecha — YYYY-MM-DD
 * @returns {Promise<Array<{ sala_id: number, sala: string, hora_inicio: string, hora_fin: string, precio: number }>>}
 */
export async function getDisponibilidad(peliculaId, fecha) {
  const q = new URLSearchParams({
    pelicula_id: String(peliculaId),
    fecha: String(fecha),
  })
  const data = await solicitud(`/api/v1/disponibilidad?${q.toString()}`, {
    method: 'GET',
  })
  if (!data.exito) {
    throw new Error(data.mensaje || 'Error al obtener disponibilidad')
  }
  return Array.isArray(data.datos) ? data.datos : []
}

/**
 * @param {object} datos
 * @param {number} datos.pelicula_id
 * @param {number} datos.sala_id
 * @param {string} datos.fecha — YYYY-MM-DD
 * @param {string} datos.hora_inicio — HH:MM o HH:MM:SS
 * @param {number} datos.cantidad_personas
 * @param {number} [datos.usuario_id]
 * @param {string} [datos.guest_id]
 */
export async function crearReserva(datos) {
  return solicitud('/api/v1/reservas', {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

/**
 * @param {object} datos
 * @param {string} datos.codigo_reserva
 * @param {string} datos.metodo_pago — yape | plin | tarjeta | efectivo
 * @param {number} datos.monto
 */
export async function pagar(datos) {
  return solicitud('/api/v1/pagos', {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

/** Sesión invitado (guest_id) para reservas sin cuenta. */
export async function crearSesionInvitado() {
  return solicitud('/api/v1/auth/invitado', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

/** Catálogo público de snacks (solo estado disponible). */
export async function getProductosConfiteria() {
  const data = await solicitud('/api/v1/confiteria/productos', { method: 'GET' })
  if (!data.exito) {
    throw new Error(data.mensaje || 'No se pudieron cargar los productos')
  }
  return Array.isArray(data.datos) ? data.datos : []
}

/** Combos disponibles (público), con desglose de productos. */
export async function getCombosConfiteria() {
  const data = await solicitud('/api/v1/confiteria/combos', { method: 'GET' })
  if (!data.exito) {
    throw new Error(data.mensaje || 'No se pudieron cargar los combos')
  }
  return Array.isArray(data.datos) ? data.datos : []
}

export const getCombos = getCombosConfiteria

/**
 * Asocia productos y/o combos a una reserva pendiente de pago.
 * @param {{ codigo_reserva: string, productos?: Array<{ producto_id: number, cantidad: number }>, combos?: Array<{ combo_id: number, cantidad: number }> }} data
 */
export async function agregarProductosConfiteria(data) {
  return solicitud('/api/v1/confiteria/agregar', {
    method: 'POST',
    body: JSON.stringify({
      codigo_reserva: data.codigo_reserva,
      productos: data.productos ?? [],
      combos: data.combos ?? [],
    }),
  })
}

/** Perfil del usuario autenticado (Sanctum). */
export async function getPerfil(token) {
  return solicitudAutenticada('/api/v1/perfil', token, { method: 'GET' })
}

/**
 * Cambiar contraseña (servidor valida y hashea).
 * @param {string} token
 * @param {{ password_actual: string, password_nueva: string, password_nueva_confirmation: string }} datos
 */
export async function cambiarPassword(token, datos) {
  return solicitudAutenticada('/api/v1/perfil/password', token, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
}

/** Próximas funciones e historial de reservas del usuario autenticado. */
export async function getHistorialReservas(token) {
  return solicitudAutenticada('/api/v1/perfil/reservas', token, {
    method: 'GET',
  })
}

/**
 * Detalle público del ticket (QR visual incluido).
 * @param {string} token TOKEN codificado en la URL del QR
 */
export async function getTicket(token) {
  const segmento = encodeURIComponent(token)
  return solicitud(`/api/v1/tickets/${segmento}`, { method: 'GET' })
}

/**
 * Validación empleado/admin: devuelve cuerpo JSON aunque sea 422 (no lanza).
 * @param {string} tokenSesion Bearer Sanctum (admin)
 * @param {string} tokenQr Token escaneado o pegado
 */
export async function validarTicket(tokenSesion, tokenQr) {
  const base = obtenerBaseUrl()
  const url = base ? `${base}/api/v1/tickets/validar` : '/api/v1/tickets/validar'
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenSesion}`,
    },
    body: JSON.stringify({ token_qr: tokenQr }),
  })

  let cuerpo = null
  const texto = await respuesta.text()
  if (texto) {
    try {
      cuerpo = JSON.parse(texto)
    } catch {
      cuerpo = { mensaje: texto }
    }
  }

  return cuerpo ?? { exito: false, mensaje: 'Respuesta vacía' }
}

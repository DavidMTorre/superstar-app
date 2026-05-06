import { Navigate, useLocation } from 'react-router-dom'

/**
 * Protege rutas del panel: requiere sesión con token y rol admin (el backend valida cada petición).
 */
function RutaAdmin({ children, estaAutenticado, esAdmin }) {
  const ubicacion = useLocation()

  if (!estaAutenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ desdeAdmin: ubicacion.pathname }}
      />
    )
  }

  if (!esAdmin) {
    return <Navigate to="/cartelera" replace />
  }

  return children
}

export default RutaAdmin

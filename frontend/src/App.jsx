import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './admin/AdminLayout'
import DashboardAdmin from './admin/DashboardAdmin'
import PeliculasAdmin from './admin/PeliculasAdmin'
import CombosAdmin from './admin/pages/CombosAdmin'
import ConfiteriaAdmin from './admin/pages/ConfiteriaAdmin'
import SalasAdmin from './admin/pages/SalasAdmin'
import SalasHorariosAdmin from './admin/pages/SalasHorariosAdmin'
import ReservasAdmin from './admin/ReservasAdmin'
import RutaAdmin from './admin/RutaAdmin'
import UsuariosAdmin from './admin/UsuariosAdmin'
import { useSesionUsuario } from './hooks/useSesionUsuario'
import { Layout } from './layout/Layout'
import CarteleraPage from './pages/CarteleraPage'
import LoginPage from './pages/LoginPage'
import ConfiteriaPage from './pages/ConfiteriaPage'
import PagoPage from './pages/PagoPage'
import RegistroPage from './pages/RegistroPage'
import ReservaPage from './pages/ReservaPage'

export default function App() {
  const sesion = useSesionUsuario()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin"
          element={
            <RutaAdmin
              estaAutenticado={sesion.estaAutenticado}
              esAdmin={sesion.esAdmin}
            >
              <AdminLayout
                usuario={sesion.usuario}
                token={sesion.token}
                cerrarSesion={sesion.cerrarSesion}
              />
            </RutaAdmin>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="peliculas" element={<PeliculasAdmin />} />
          <Route path="salas" element={<SalasAdmin />} />
          <Route path="salas/horarios" element={<SalasHorariosAdmin />} />
          <Route path="confiteria" element={<ConfiteriaAdmin />} />
          <Route path="combos" element={<CombosAdmin />} />
          <Route path="reservas" element={<ReservasAdmin />} />
          <Route path="usuarios" element={<UsuariosAdmin />} />
        </Route>

        <Route
          element={
            <Layout
              usuario={sesion.usuario}
              alCerrarSesion={sesion.cerrarSesion}
              esAdmin={sesion.esAdmin}
            />
          }
        >
          <Route path="/" element={<Navigate to="/cartelera" replace />} />
          <Route
            path="/login"
            element={<LoginPage iniciarSesion={sesion.iniciarSesion} />}
          />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/cartelera" element={<CarteleraPage />} />
          <Route
            path="/reserva/:peliculaId"
            element={<ReservaPage usuario={sesion.usuario} />}
          />
          <Route path="/confiteria" element={<ConfiteriaPage />} />
          <Route path="/pago" element={<PagoPage />} />
          <Route path="*" element={<Navigate to="/cartelera" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

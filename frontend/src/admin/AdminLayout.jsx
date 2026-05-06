import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import './admin.css'

const enlaces = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/peliculas', label: 'Películas' },
  { to: '/admin/salas', label: 'Salas' },
  { to: '/admin/salas/horarios', label: 'Horarios sala' },
  { to: '/admin/confiteria', label: 'Confitería' },
  { to: '/admin/combos', label: 'Combos' },
  { to: '/admin/reservas', label: 'Reservas' },
  { to: '/admin/usuarios', label: 'Usuarios' },
]

export function AdminLayout({ usuario, token, cerrarSesion }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">MiniCine · Admin</div>
        <button
          type="button"
          className="admin-sidebar__toggle"
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto((v) => !v)}
        >
          {menuAbierto ? 'Ocultar menú' : 'Menú'}
        </button>
        <nav
          className={`admin-sidebar__collapsible ${
            menuAbierto ? 'admin-sidebar__collapsible--open' : ''
          }`}
          aria-label="Panel administración"
        >
          {enlaces.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-sidebar__link${isActive ? ' admin-sidebar__link--active' : ''}`
              }
              onClick={() => setMenuAbierto(false)}
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/cartelera"
            className="admin-sidebar__link"
            style={{ marginTop: 'var(--space-sm)' }}
            onClick={() => setMenuAbierto(false)}
          >
            Volver al sitio
          </Link>
        </nav>
        <div className="admin-sidebar__footer">
          <div>{usuario?.nombre}</div>
          <button
            type="button"
            className="mc-btn mc-btn--secundario"
            style={{
              marginTop: 'var(--space-sm)',
              width: '100%',
              borderColor: 'rgba(255,255,255,0.35)',
              color: '#fff',
            }}
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-main__inner">
          <Outlet context={{ token }} />
        </div>
      </div>
    </div>
  )
}

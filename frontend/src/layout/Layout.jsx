import { Link, Outlet } from 'react-router-dom'

export function Layout({ usuario, alCerrarSesion, esAdmin }) {
  return (
    <div className="mc-layout">
      <header
        style={{
          backgroundColor: 'var(--color-secondary)',
          color: '#fff',
          padding: 'var(--space-md) var(--space-lg)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <div
          className="mc-main"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-md)',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0',
          }}
        >
          <Link
            to="/cartelera"
            style={{
              fontWeight: 800,
              fontSize: '1.15rem',
              color: 'var(--color-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            MiniCine Superstar
          </Link>
          <nav
            aria-label="Principal"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-lg)',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/cartelera"
              style={{ color: '#eee', fontWeight: 500 }}
            >
              Cartelera
            </Link>
            {usuario && esAdmin ? (
              <Link
                to="/admin"
                style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}
              >
                Administración
              </Link>
            ) : null}
            {usuario ? (
              <>
                <span style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                  Hola, {usuario.nombre?.split(' ')?.[0] ?? 'usuario'}
                </span>
                <button
                  type="button"
                  className="mc-btn mc-btn--secundario"
                  style={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: '#fff',
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.875rem',
                  }}
                  onClick={alCerrarSesion}
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/registro"
                  style={{ color: '#eee', fontWeight: 500 }}
                >
                  Registrarse
                </Link>
                <Link
                  to="/login"
                  style={{ color: '#eee', fontWeight: 500 }}
                >
                  Iniciar sesión
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mc-main">
        <Outlet />
      </main>
      <footer
        style={{
          marginTop: 'auto',
          padding: 'var(--space-xl) var(--space-md)',
          textAlign: 'center',
          color: 'var(--color-text-light)',
          fontSize: '0.85rem',
          borderTop: '1px solid rgba(31,31,31,0.08)',
        }}
      >
        © {new Date().getFullYear()} MiniCine Superstar
      </footer>
    </div>
  )
}

import { Link, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Clapperboard,
  Film,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserRound,
  UserRoundPlus,
} from 'lucide-react'
import { cn } from '../lib/cn'

function NavLinkDesktop({ to, children, isActive }) {
  return (
    <Link
      to={to}
      className={cn(
        'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
        isActive
          ? 'text-[var(--color-primary-light)]'
          : 'text-[var(--color-text-light)] hover:text-[var(--color-text)]',
      )}
    >
      {isActive ? (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 -z-10 rounded-lg bg-[rgba(255,122,0,0.12)] shadow-[0_0_24px_rgba(255,122,0,0.15)]"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      ) : null}
      <span className="relative z-10">{children}</span>
    </Link>
  )
}

function NavItemMobile({ to, label, icon: Icon, isActive, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        'flex min-h-[48px] min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors',
        isActive
          ? 'text-[var(--color-primary-light)]'
          : 'text-[var(--color-text-muted)] active:text-[var(--color-text-light)]',
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <span
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200',
          isActive
            ? 'bg-[rgba(255,122,0,0.18)] text-[var(--color-primary-light)] shadow-[0_0_20px_rgba(255,122,0,0.25)]'
            : 'bg-transparent',
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 2} aria-hidden />
      </span>
      {label}
    </Link>
  )
}

export function Layout({ usuario, alCerrarSesion, esAdmin }) {
  const { pathname } = useLocation()

  return (
    <div className="mc-layout flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-text)]">
      <motion.header
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-40 border-b border-[var(--color-border-subtle)] bg-[rgba(11,11,15,0.72)] shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      >
        <div className="mx-auto flex h-[var(--header-height)] max-w-6xl items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
          <Link
            to="/cartelera"
            className="group flex shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[0_0_20px_var(--color-primary-glow)] transition-transform duration-200 group-hover:scale-105">
              <Clapperboard className="h-5 w-5" aria-hidden />
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-gold)]">
                Superstar
              </span>
              <span className="text-base font-extrabold tracking-tight text-[var(--color-text)]">
                MiniCine
              </span>
            </span>
          </Link>

          <nav
            aria-label="Principal"
            className="hidden items-center gap-1 md:flex md:flex-wrap md:justify-end"
          >
            <NavLinkDesktop to="/cartelera" isActive={pathname.startsWith('/cartelera')}>
              Cartelera
            </NavLinkDesktop>
            {usuario ? (
              <NavLinkDesktop to="/perfil" isActive={pathname.startsWith('/perfil')}>
                Mi perfil
              </NavLinkDesktop>
            ) : null}
            {usuario && esAdmin ? (
              <NavLinkDesktop to="/admin" isActive={pathname.startsWith('/admin')}>
                <span className="inline-flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" aria-hidden />
                  Admin
                </span>
              </NavLinkDesktop>
            ) : null}
            {usuario ? (
              <div className="ml-2 flex items-center gap-3 border-l border-[var(--color-border-subtle)] pl-4">
                <span className="max-w-[140px] truncate text-xs text-[var(--color-text-muted)]">
                  Hola,{' '}
                  <span className="font-semibold text-[var(--color-text-light)]">
                    {usuario.nombre?.split(' ')?.[0] ?? 'usuario'}
                  </span>
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[rgba(255,122,0,0.4)] hover:text-[var(--color-primary-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                  onClick={alCerrarSesion}
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden />
                  Salir
                </button>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2 border-l border-[var(--color-border-subtle)] pl-4">
                <Link
                  to="/registro"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-light)] transition-colors hover:text-[var(--color-text)]"
                >
                  Registrarse
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_20px_var(--color-primary-glow)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Iniciar sesión
                </Link>
              </div>
            )}
          </nav>
        </div>
      </motion.header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-12 lg:px-8">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border-subtle)] bg-[rgba(11,11,15,0.88)] px-2 pt-1 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
        aria-label="Navegación móvil"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1">
          <NavItemMobile
            to="/cartelera"
            label="Cartelera"
            icon={Film}
            isActive={pathname === '/cartelera' || pathname.startsWith('/reserva')}
          />
          {usuario ? (
            <NavItemMobile
              to="/perfil"
              label="Perfil"
              icon={UserRound}
              isActive={pathname.startsWith('/perfil')}
            />
          ) : (
            <>
              <NavItemMobile
                to="/login"
                label="Entrar"
                icon={LogIn}
                isActive={pathname.startsWith('/login')}
              />
              <NavItemMobile
                to="/registro"
                label="Registro"
                icon={UserRoundPlus}
                isActive={pathname.startsWith('/registro')}
              />
            </>
          )}
          {usuario && esAdmin ? (
            <NavItemMobile
              to="/admin"
              label="Admin"
              icon={LayoutDashboard}
              isActive={pathname.startsWith('/admin')}
            />
          ) : null}
        </div>
      </nav>

      <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 py-8 text-center text-xs text-[var(--color-text-muted)] md:pb-8">
        <p className="mx-auto max-w-6xl px-4">
          © {new Date().getFullYear()} MiniCine Superstar · Experiencia premium en cada función.
        </p>
      </footer>
    </div>
  )
}

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clapperboard, Film } from 'lucide-react'
import { login } from '../api/api'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { esPerfilUsuarioValido } from '../hooks/useSesionUsuario'
import { mensajeDesdeError } from '../utils/erroresApi'

function mensajeRegistroDesdeEstado(state) {
  const m = state?.mensajeRegistroExitoso
  return typeof m === 'string' && m.trim() !== '' ? m.trim() : ''
}

export default function LoginPage({ iniciarSesion }) {
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const [mensajeExito, setMensajeExito] = useState(() =>
    mensajeRegistroDesdeEstado(ubicacion.state),
  )
  const [correo, setCorreo] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')
    setMensajeExito('')
    setCargando(true)

    try {
      const respuesta = await login({ correo: correo.trim(), contraseña })
      const perfil = respuesta?.datos?.usuario

      if (!perfil || !esPerfilUsuarioValido(perfil)) {
        setError(
          'La respuesta del servidor no incluye un usuario válido. Intenta de nuevo.',
        )
        return
      }

      const tokenAcceso = respuesta?.datos?.token
      if (typeof tokenAcceso !== 'string' || tokenAcceso.trim() === '') {
        setError('No se recibió token de sesión. Intenta de nuevo.')
        return
      }

      iniciarSesion({ usuario: perfil, token: tokenAcceso })
      navegar(
        perfil.rol === 'admin' ? '/admin' : '/cartelera',
        { replace: true },
      )
    } catch (err) {
      setError(mensajeDesdeError(err))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)]/40 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:min-h-[560px] lg:flex-row">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="relative hidden flex-1 flex-col justify-between overflow-hidden p-10 lg:flex"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(11,11,15,0.95) 0%, rgba(255,122,0,0.15) 45%, rgba(11,11,15,0.92) 100%), radial-gradient(circle at 20% 80%, rgba(201,169,110,0.2), transparent 50%)',
          }}
        />
        <div className="relative z-10">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[0_0_32px_var(--color-primary-glow)]">
            <Clapperboard className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-[var(--color-text)]">
            Tu cine,
            <br />
            <span className="bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-accent-gold)] bg-clip-text text-transparent">
              tu experiencia
            </span>
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)]">
            Accede para reservar funciones, gestionar tu perfil y recibir tickets digitales con QR.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[var(--color-accent-gold)]">
          <Film className="h-4 w-4" aria-hidden />
          MiniCine Superstar
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10"
      >
        <div className="mx-auto w-full max-w-[400px]">
          <h1 className="mb-1 text-center text-2xl font-extrabold tracking-tight lg:text-left">
            Iniciar sesión
          </h1>
          <p className="mb-8 text-center text-sm text-[var(--color-text-muted)] lg:text-left">
            Accede para reservar con tu cuenta registrada.
          </p>

          {mensajeExito ? (
            <div className="mc-alerta mc-alerta--exito mb-4" role="status">
              {mensajeExito}
            </div>
          ) : null}

          {error ? <MensajeAlerta>{error}</MensajeAlerta> : null}

          <form onSubmit={manejarEnvio} className="space-y-1">
            <Input
              etiqueta="Correo"
              name="correo"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            <Input
              etiqueta="Contraseña"
              name="contraseña"
              type="password"
              autoComplete="current-password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
            />
            <div className="pt-4">
              <Button
                type="submit"
                variante="primario"
                anchoCompleto
                cargando={cargando}
              >
                Entrar
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
            ¿No tienes cuenta?{' '}
            <Link
              to="/registro"
              className="font-semibold text-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
            >
              Regístrate
            </Link>
          </p>
          <p className="mt-3 text-center text-sm">
            <Link
              to="/cartelera"
              className="text-[var(--color-text-light)] hover:text-[var(--color-text)]"
            >
              Ver cartelera sin cuenta
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

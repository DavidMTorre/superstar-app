import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, UserPlus } from 'lucide-react'
import { registro } from '../api/api'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { mapaErroresValidacion, mensajeDesdeError } from '../utils/erroresApi'

const GENEROS = [
  { valor: '', etiqueta: 'Selecciona…' },
  { valor: 'femenino', etiqueta: 'Femenino' },
  { valor: 'masculino', etiqueta: 'Masculino' },
  { valor: 'otro', etiqueta: 'Otro' },
]

export default function RegistroPage() {
  const navegar = useNavigate()
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [genero, setGenero] = useState('')
  const [cargando, setCargando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [erroresCampo, setErroresCampo] = useState({})

  async function manejarEnvio(e) {
    e.preventDefault()
    setErrorGeneral('')
    setErroresCampo({})
    setCargando(true)

    try {
      await registro({
        nombre: nombre.trim(),
        correo: correo.trim(),
        contraseña,
        telefono: telefono.trim(),
        fecha_nacimiento: fechaNacimiento,
        genero: genero.trim(),
      })

      navegar('/login', {
        replace: false,
        state: { mensajeRegistroExitoso: 'Registro exitoso' },
      })
    } catch (err) {
      const mapa = mapaErroresValidacion(err)
      setErroresCampo(mapa)
      if (Object.keys(mapa).length > 0) {
        setErrorGeneral('Revisa los campos marcados.')
      } else {
        setErrorGeneral(mensajeDesdeError(err))
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)]/40 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:flex-row-reverse">
      <motion.aside
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="relative hidden flex-1 flex-col justify-center overflow-hidden p-10 lg:flex"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,122,0,0.2)] via-[var(--color-surface)] to-[var(--color-background)]" />
        <div className="relative z-10">
          <UserPlus className="mb-6 h-14 w-14 text-[var(--color-primary-light)] drop-shadow-[0_0_24px_var(--color-primary-glow)]" aria-hidden />
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            Crea tu perfil
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)]">
            Guarda preferencias, revisa historial y recibe tickets con QR en un solo lugar.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-[var(--color-text-light)]">
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-[var(--color-accent-gold)]" aria-hidden />
              Reservas más rápidas
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-[var(--color-accent-gold)]" aria-hidden />
              Historial y tickets
            </li>
          </ul>
        </div>
      </motion.aside>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-1 flex-col justify-center px-5 py-8 sm:px-8"
      >
        <div className="mx-auto w-full max-w-[520px]">
          <h1 className="mb-1 text-center text-2xl font-extrabold tracking-tight lg:text-left">
            Crear cuenta
          </h1>
          <p className="mb-6 text-center text-sm text-[var(--color-text-muted)] lg:text-left">
            Completa tus datos para reservar con tu perfil.
          </p>

          {errorGeneral ? <MensajeAlerta>{errorGeneral}</MensajeAlerta> : null}

          <form onSubmit={manejarEnvio} noValidate className="mc-form-panel !m-0 !max-w-none border-0 bg-transparent p-0 shadow-none">
            <Input
              etiqueta="Nombre completo"
              name="nombre"
              autoComplete="name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              error={erroresCampo.nombre}
            />
            <Input
              etiqueta="Correo electrónico"
              name="correo"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              error={erroresCampo.correo}
            />
            <Input
              etiqueta="Contraseña (mín. 6 caracteres)"
              name="contraseña"
              type="password"
              autoComplete="new-password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
              minLength={6}
              error={erroresCampo.contraseña}
            />
            <Input
              etiqueta="Teléfono"
              name="telefono"
              type="tel"
              autoComplete="tel"
              placeholder="987654321"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              error={erroresCampo.telefono}
            />
            <Input
              etiqueta="Fecha de nacimiento"
              name="fecha_nacimiento"
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              required
              error={erroresCampo.fecha_nacimiento}
            />

            <div className="mc-input-wrap">
              <label htmlFor="registro-genero">Género</label>
              <select
                id="registro-genero"
                name="genero"
                className="mc-input"
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                required
                aria-invalid={erroresCampo.genero ? 'true' : undefined}
              >
                {GENEROS.map((g) => (
                  <option key={g.valor === '' ? '_placeholder' : g.valor} value={g.valor}>
                    {g.etiqueta}
                  </option>
                ))}
              </select>
              {erroresCampo.genero ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>
                  {erroresCampo.genero}
                </span>
              ) : null}
            </div>

            <Button
              type="submit"
              variante="primario"
              anchoCompleto
              cargando={cargando}
            >
              Registrarme
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-semibold text-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

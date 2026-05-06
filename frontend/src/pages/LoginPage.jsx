import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
    <div style={{ paddingTop: 'var(--space-2xl)' }}>
      <div className="mc-form-panel">
        <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          Iniciar sesión
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: 'var(--color-text-light)',
            marginBottom: 'var(--space-lg)',
            fontSize: '0.95rem',
          }}
        >
          Accede para reservar con tu cuenta registrada.
        </p>

        {mensajeExito ? (
          <div className="mc-alerta mc-alerta--exito" role="status">
            {mensajeExito}
          </div>
        ) : null}

        {error ? <MensajeAlerta>{error}</MensajeAlerta> : null}

        <form onSubmit={manejarEnvio}>
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
          <Button
            type="submit"
            variante="primario"
            anchoCompleto
            cargando={cargando}
          >
            Entrar
          </Button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: 'var(--space-lg)',
            fontSize: '0.9rem',
          }}
        >
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>

        <p
          style={{
            textAlign: 'center',
            marginTop: 'var(--space-md)',
            fontSize: '0.9rem',
          }}
        >
          <Link to="/cartelera">Ver cartelera sin cuenta</Link>
        </p>
      </div>
    </div>
  )
}

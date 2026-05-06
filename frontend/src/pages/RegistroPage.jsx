import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    <div style={{ paddingTop: 'var(--space-xl)' }}>
      <div className="mc-form-panel" style={{ maxWidth: '520px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
          Crear cuenta
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: 'var(--color-text-light)',
            marginBottom: 'var(--space-lg)',
            fontSize: '0.95rem',
          }}
        >
          Completa tus datos para reservar con tu perfil.
        </p>

        {errorGeneral ? (
          <MensajeAlerta>{errorGeneral}</MensajeAlerta>
        ) : null}

        <form onSubmit={manejarEnvio} noValidate>
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

        <p
          style={{
            textAlign: 'center',
            marginTop: 'var(--space-lg)',
            fontSize: '0.9rem',
          }}
        >
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}

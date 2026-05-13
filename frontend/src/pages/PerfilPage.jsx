import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { History, UserCircle2 } from 'lucide-react'
import { cambiarPassword, getHistorialReservas, getPerfil } from '../api/api'
import { Button } from '../components/Button'
import { Cargando } from '../components/Cargando'
import { Input } from '../components/Input'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { mapaErroresValidacion, mensajeDesdeError } from '../utils/erroresApi'

function TarjetaReserva({ item }) {
  const imagen = item?.imagen_url
  const titulo = item?.pelicula || 'Película'
  const productos = Array.isArray(item?.productos_confiteria) ? item.productos_confiteria : []

  return (
    <article
      className="mc-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 96px', width: '96px' }}>
          {imagen ? (
            <img
              src={imagen}
              alt=""
              style={{
                width: '96px',
                aspectRatio: '2/3',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
              }}
            />
          ) : (
            <div
              className="mc-placeholder-img"
              style={{
                width: '96px',
                aspectRatio: '2/3',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '0.25rem',
              }}
            >
              {titulo}
            </div>
          )}
        </div>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem' }}>{titulo}</h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-light)' }}>
            {item?.fecha ?? ''}
            {item?.hora_inicio ? ` · ${item.hora_inicio}` : ''}
            {item?.hora_fin ? ` – ${item.hora_fin}` : ''}
          </p>
          {item?.sala ? (
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem' }}>
              Sala: <strong>{item.sala}</strong>
            </p>
          ) : null}
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem' }}>
            Personas: <strong>{item?.cantidad_personas ?? '—'}</strong>
            {' · '}
            Total:{' '}
            <strong>
              S/ {typeof item?.total_pagado === 'number' ? item.total_pagado.toFixed(2) : '—'}
            </strong>
          </p>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
            Pago: <strong style={{ color: 'var(--color-text)' }}>{item?.estado_pago ?? '—'}</strong>
          </p>
          {item?.qr_url ? (
            <p style={{ marginTop: 'var(--space-md)', marginBottom: 0 }}>
              <a
                href={item.qr_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mc-btn mc-btn--secundario"
                style={{
                  display: 'inline-block',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  padding: '0.45rem 1rem',
                }}
              >
                Ver ticket
              </a>
            </p>
          ) : null}
        </div>
      </div>

      {productos.length > 0 ? (
        <div
          style={{
            marginTop: 'var(--space-md)',
            paddingTop: 'var(--space-md)',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Confitería</p>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
            {productos.map((p, idx) => (
              <li key={`${item?.codigo_reserva ?? 'r'}-${idx}`}>
                {p?.nombre ?? 'Producto'} × {p?.cantidad ?? 0}{' '}
                <span style={{ color: 'var(--color-text)' }}>
                  (S/ {typeof p?.subtotal === 'number' ? p.subtotal.toFixed(2) : '—'})
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}

export default function PerfilPage({ usuario, token }) {
  const [pestana, setPestana] = useState('cuenta')
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  const [proximas, setProximas] = useState([])
  const [historial, setHistorial] = useState([])
  const [cargandoReservas, setCargandoReservas] = useState(true)
  const [errorReservas, setErrorReservas] = useState('')

  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [enviandoPass, setEnviandoPass] = useState(false)
  const [errorPass, setErrorPass] = useState('')
  const [exitoPass, setExitoPass] = useState('')
  const [erroresPass, setErroresPass] = useState({})

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setCargandoReservas(true)
    setErrorCarga('')
    setErrorReservas('')

    try {
      const [respPerfil, respReservas] = await Promise.all([
        getPerfil(token),
        getHistorialReservas(token),
      ])

      setPerfil(respPerfil?.datos ?? null)

      const datosR = respReservas?.datos
      setProximas(Array.isArray(datosR?.proximas) ? datosR.proximas : [])
      setHistorial(Array.isArray(datosR?.historial) ? datosR.historial : [])
    } catch (err) {
      const msg = mensajeDesdeError(err)
      setErrorCarga(msg)
      setErrorReservas(msg)
    } finally {
      setCargando(false)
      setCargandoReservas(false)
    }
  }, [token])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  async function manejarPassword(e) {
    e.preventDefault()
    setErrorPass('')
    setExitoPass('')
    setErroresPass({})
    setEnviandoPass(true)

    try {
      await cambiarPassword(token, {
        password_actual: passwordActual,
        password_nueva: passwordNueva,
        password_nueva_confirmation: passwordConfirm,
      })
      setExitoPass('Contraseña actualizada correctamente.')
      setPasswordActual('')
      setPasswordNueva('')
      setPasswordConfirm('')
    } catch (err) {
      const mapa = mapaErroresValidacion(err)
      setErroresPass(mapa)
      if (Object.keys(mapa).length > 0) {
        setErrorPass('Revisa los campos marcados.')
      } else {
        setErrorPass(mensajeDesdeError(err))
      }
    } finally {
      setEnviandoPass(false)
    }
  }

  if (cargando && !perfil && !errorCarga) {
    return <Cargando mensaje="Cargando perfil…" />
  }

  const nombreMostrar = perfil?.nombre ?? usuario?.nombre ?? 'Usuario'
  const correoMostrar = perfil?.correo ?? usuario?.correo ?? ''
  const fechaRegistro = perfil?.fecha_registro ?? ''

  return (
    <div className="mx-auto max-w-4xl pb-10 pt-2">
      <p className="mb-4">
        <Link
          to="/cartelera"
          className="text-sm font-medium text-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
        >
          ← Cartelera
        </Link>
      </p>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-extrabold tracking-tight">Mi perfil</h1>
          <p className="mb-0 text-sm text-[var(--color-text-muted)]">
            Datos de tu cuenta y reservas en MiniCine Superstar.
          </p>
        </div>
        <div className="flex rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-card)]/80 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setPestana('cuenta')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
              pestana === 'cuenta'
                ? 'bg-[rgba(255,122,0,0.2)] text-[var(--color-primary-light)] shadow-[0_0_20px_rgba(255,122,0,0.12)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <UserCircle2 className="h-4 w-4" aria-hidden />
            Cuenta
          </button>
          <button
            type="button"
            onClick={() => setPestana('reservas')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
              pestana === 'reservas'
                ? 'bg-[rgba(255,122,0,0.2)] text-[var(--color-primary-light)] shadow-[0_0_20px_rgba(255,122,0,0.12)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <History className="h-4 w-4" aria-hidden />
            Reservas
          </button>
        </div>
      </div>

      {errorCarga ? (
        <div className="mb-6">
          <MensajeAlerta>{errorCarga}</MensajeAlerta>
        </div>
      ) : null}

      {pestana === 'cuenta' ? (
        <motion.div
          key="cuenta"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-8"
        >
          <section>
            <div className="mc-form-panel !max-w-none border border-[var(--color-border-subtle)] bg-[var(--color-card)]/90 shadow-[0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <h2 className="mb-4 text-lg font-bold">Datos personales</h2>
          <dl
            style={{
              margin: 0,
              display: 'grid',
              gap: 'var(--space-sm)',
              fontSize: '0.95rem',
            }}
          >
            <div>
              <dt style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '0.15rem' }}>
                Nombre
              </dt>
              <dd style={{ margin: 0 }}>{nombreMostrar}</dd>
            </div>
            <div>
              <dt style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '0.15rem' }}>
                Correo
              </dt>
              <dd style={{ margin: 0 }}>{correoMostrar || '—'}</dd>
            </div>
            <div>
              <dt style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '0.15rem' }}>
                Fecha de registro
              </dt>
              <dd style={{ margin: 0 }}>{fechaRegistro || '—'}</dd>
            </div>
          </dl>
            </div>
          </section>

          <section>
            <div className="mc-form-panel !max-w-none border border-[var(--color-border-subtle)] bg-[var(--color-card)]/90 shadow-[0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <h2 className="mb-4 text-lg font-bold">Cambiar contraseña</h2>

          {exitoPass ? (
            <div className="mc-alerta mc-alerta--exito" role="status" style={{ marginBottom: 'var(--space-md)' }}>
              {exitoPass}
            </div>
          ) : null}

          {errorPass ? <MensajeAlerta>{errorPass}</MensajeAlerta> : null}

          <form onSubmit={manejarPassword} noValidate>
            <Input
              etiqueta="Contraseña actual"
              name="password_actual"
              type="password"
              autoComplete="current-password"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              required
              error={erroresPass.password_actual}
            />
            <Input
              etiqueta="Nueva contraseña"
              name="password_nueva"
              type="password"
              autoComplete="new-password"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              required
              error={erroresPass.password_nueva}
            />
            <Input
              etiqueta="Confirmar nueva contraseña"
              name="password_nueva_confirmation"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              error={erroresPass.password_nueva_confirmation}
            />
            <Button type="submit" variante="primario" anchoCompleto cargando={enviandoPass}>
              Actualizar contraseña
            </Button>
          </form>
            </div>
          </section>
        </motion.div>
      ) : (
        <motion.div
          key="reservas"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-10"
        >
          <section>
            <h2 className="mb-4 text-lg font-bold">Próximas funciones</h2>

        {cargandoReservas ? (
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Cargando reservas…</p>
        ) : errorReservas ? (
          <MensajeAlerta>{errorReservas}</MensajeAlerta>
        ) : proximas.length === 0 ? (
          <p
            style={{
              color: 'var(--color-text-light)',
              padding: 'var(--space-lg)',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed rgba(31,31,31,0.15)',
            }}
          >
            No tienes funciones próximas reservadas.
          </p>
        ) : (
          <div
            className="mc-grid-peliculas"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            }}
          >
            {proximas.map((item) => (
              <TarjetaReserva key={item.codigo_reserva} item={item} />
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 'var(--space-xl)' }}>
        <h2 className="mb-4 text-lg font-bold">Historial</h2>

        {cargandoReservas ? (
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Cargando reservas…</p>
        ) : errorReservas ? null : historial.length === 0 ? (
          <p
            style={{
              color: 'var(--color-text-light)',
              padding: 'var(--space-lg)',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed rgba(31,31,31,0.15)',
            }}
          >
            Aún no hay funciones pasadas en tu historial.
          </p>
        ) : (
          <div
            className="mc-grid-peliculas"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            }}
          >
            {historial.map((item) => (
              <TarjetaReserva key={item.codigo_reserva} item={item} />
            ))}
          </div>
        )}
      </section>
        </motion.div>
      )}
    </div>
  )
}

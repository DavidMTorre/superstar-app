import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getAdminUsuarios, putAdminUsuarioRol } from '../api/api'
import { Button } from '../components/Button'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { mensajeDesdeError } from '../utils/erroresApi'

export default function UsuariosAdmin() {
  const { token } = useOutletContext()
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [accionId, setAccionId] = useState(null)

  const cargar = useCallback(async () => {
    setError('')
    setCargando(true)
    try {
      const r = await getAdminUsuarios(token)
      setLista(r?.datos?.usuarios ?? [])
    } catch (e) {
      setError(mensajeDesdeError(e))
      setLista([])
    } finally {
      setCargando(false)
    }
  }, [token])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function cambiarRol(usuario, nuevoRol) {
    setError('')
    setAccionId(usuario.id)
    try {
      await putAdminUsuarioRol(token, usuario.id, nuevoRol)
      await cargar()
    } catch (e) {
      setError(mensajeDesdeError(e))
    } finally {
      setAccionId(null)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>Usuarios</h1>
      {error ? (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <MensajeAlerta>{error}</MensajeAlerta>
        </div>
      ) : null}

      {cargando ? (
        <p style={{ color: 'var(--color-text-light)' }}>Cargando…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {lista.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.correo}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          u.rol === 'admin'
                            ? 'var(--color-primary)'
                            : 'var(--color-text)',
                      }}
                    >
                      {u.rol}
                    </span>
                  </td>
                  <td>
                    {u.rol === 'cliente' ? (
                      <Button
                        type="button"
                        variante="primario"
                        cargando={accionId === u.id}
                        onClick={() => cambiarRol(u, 'admin')}
                      >
                        Dar rol admin
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variante="secundario"
                        cargando={accionId === u.id}
                        onClick={() => cambiarRol(u, 'cliente')}
                      >
                        Quitar admin
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

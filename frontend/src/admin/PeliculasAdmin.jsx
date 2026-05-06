import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  deleteAdminPelicula,
  getAdminPeliculas,
  postAdminPelicula,
  putAdminPelicula,
} from '../api/api'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { mensajeDesdeError } from '../utils/erroresApi'

const estadoInicialForm = {
  titulo: '',
  descripcion: '',
  categoria: '',
  duracion: '',
  imagen_url: '',
  estado: 'disponible',
}

export default function PeliculasAdmin() {
  const { token } = useOutletContext()
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(estadoInicialForm)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cargarLista = useCallback(async () => {
    setError('')
    try {
      const r = await getAdminPeliculas(token)
      setLista(r?.datos?.peliculas ?? [])
    } catch (e) {
      setError(mensajeDesdeError(e))
      setLista([])
    } finally {
      setCargando(false)
    }
  }, [token])

  useEffect(() => {
    cargarLista()
  }, [cargarLista])

  function abrirNuevo() {
    setEditandoId(null)
    setForm(estadoInicialForm)
  }

  function abrirEditar(p) {
    setEditandoId(p.id)
    setForm({
      titulo: p.titulo ?? '',
      descripcion: p.descripcion ?? '',
      categoria: p.categoria ?? '',
      duracion: String(p.duracion ?? ''),
      imagen_url: p.imagen_url ?? '',
      estado: p.estado ?? 'disponible',
    })
  }

  async function enviarForm(e) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    const payload = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || null,
      categoria: form.categoria.trim(),
      duracion: Number(form.duracion),
      imagen_url: form.imagen_url.trim() || null,
      estado: form.estado,
    }
    try {
      if (editandoId) {
        await putAdminPelicula(token, editandoId, payload)
      } else {
        await postAdminPelicula(token, payload)
      }
      abrirNuevo()
      await cargarLista()
    } catch (err) {
      setError(mensajeDesdeError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar esta película? No debe tener reservas.')) {
      return
    }
    setError('')
    try {
      await deleteAdminPelicula(token, id)
      await cargarLista()
    } catch (err) {
      setError(mensajeDesdeError(err))
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>Películas</h1>
      {error ? (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <MensajeAlerta>{error}</MensajeAlerta>
        </div>
      ) : null}

      <div className="admin-form-panel">
        <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.15rem' }}>
          {editandoId ? `Editar película #${editandoId}` : 'Nueva película'}
        </h2>
        <form onSubmit={enviarForm}>
          <div className="admin-form-grid">
            <Input
              etiqueta="Título"
              name="titulo"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              required
            />
            <Input
              etiqueta="Categoría"
              name="categoria"
              value={form.categoria}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoria: e.target.value }))
              }
              required
            />
            <Input
              etiqueta="Duración (min)"
              name="duracion"
              type="number"
              min={1}
              value={form.duracion}
              onChange={(e) =>
                setForm((f) => ({ ...f, duracion: e.target.value }))
              }
              required
            />
            <div className="mc-input-wrap">
              <label htmlFor="estadoPel">Estado</label>
              <select
                id="estadoPel"
                name="estado"
                className="mc-input"
                value={form.estado}
                onChange={(e) =>
                  setForm((f) => ({ ...f, estado: e.target.value }))
                }
              >
                <option value="disponible">disponible</option>
                <option value="no_disponible">no_disponible</option>
              </select>
            </div>
            <Input
              etiqueta="URL imagen (opcional)"
              name="imagen_url"
              value={form.imagen_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, imagen_url: e.target.value }))
              }
            />
          </div>
          <div className="mc-input-wrap" style={{ marginTop: 'var(--space-md)' }}>
            <label htmlFor="descPel">Descripción</label>
            <textarea
              id="descPel"
              name="descripcion"
              className="mc-input"
              rows={3}
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({ ...f, descripcion: e.target.value }))
              }
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-md)',
              marginTop: 'var(--space-lg)',
            }}
          >
            <Button type="submit" variante="primario" cargando={guardando}>
              {editandoId ? 'Guardar cambios' : 'Crear película'}
            </Button>
            {editandoId ? (
              <Button type="button" variante="secundario" onClick={abrirNuevo}>
                Cancelar edición
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.15rem' }}>
        Catálogo
      </h2>
      {cargando ? (
        <p style={{ color: 'var(--color-text-light)' }}>Cargando…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Duración</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.titulo}</td>
                  <td>{p.categoria}</td>
                  <td>{p.duracion} min</td>
                  <td>{p.estado}</td>
                  <td>
                    <Button
                      type="button"
                      variante="opcion"
                      style={{ marginRight: '0.5rem' }}
                      onClick={() => abrirEditar(p)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variante="secundario"
                      onClick={() => eliminar(p.id)}
                    >
                      Eliminar
                    </Button>
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

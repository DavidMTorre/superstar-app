import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  getAdminSalas,
  patchAdminSalaEstado,
  postAdminSala,
  putAdminSala,
} from '../../api/api'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { MensajeAlerta } from '../../components/MensajeAlerta'
import { mensajeDesdeError } from '../../utils/erroresApi'

const formInicial = { nombre: '', estado: 'disponible', precio: '', tiempo_limpieza: '15' }

export default function SalasAdmin() {
  const { token } = useOutletContext()
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [form, setForm] = useState(formInicial)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [toggleId, setToggleId] = useState(null)

  const cargarLista = useCallback(async () => {
    setError('')
    try {
      const r = await getAdminSalas(token)
      setLista(r?.datos?.salas ?? [])
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

  function limpiarMensajes() {
    setExito('')
    setError('')
  }

  function abrirNueva() {
    setEditandoId(null)
    setForm(formInicial)
    limpiarMensajes()
  }

  function abrirEditar(s) {
    setEditandoId(s.id)
    setForm({
      nombre: s.nombre ?? '',
      estado: s.estado === 'inactiva' ? 'inactiva' : 'disponible',
      precio: s.precio != null ? String(s.precio) : '',
      tiempo_limpieza:
        s.tiempo_limpieza != null ? String(s.tiempo_limpieza) : '15',
    })
    limpiarMensajes()
  }

  async function enviarForm(e) {
    e.preventDefault()
    setGuardando(true)
    limpiarMensajes()
    const payload = {
      nombre: form.nombre.trim(),
      estado: form.estado,
      precio: Number(form.precio),
      tiempo_limpieza: Number(form.tiempo_limpieza),
    }
    try {
      if (editandoId) {
        await putAdminSala(token, editandoId, payload)
        setExito('Sala actualizada correctamente.')
      } else {
        await postAdminSala(token, payload)
        setExito('Sala creada correctamente.')
      }
      setEditandoId(null)
      setForm(formInicial)
      await cargarLista()
    } catch (err) {
      setError(mensajeDesdeError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function alternarEstado(sala) {
    const siguiente = sala.estado === 'disponible' ? 'inactiva' : 'disponible'
    setToggleId(sala.id)
    limpiarMensajes()
    try {
      await patchAdminSalaEstado(token, sala.id, siguiente)
      setExito(
        siguiente === 'disponible'
          ? 'Sala activada (disponible).'
          : 'Sala desactivada (inactiva).'
      )
      await cargarLista()
    } catch (err) {
      setError(mensajeDesdeError(err))
    } finally {
      setToggleId(null)
    }
  }

  return (
    <div>
      <header className="admin-page-hero admin-page-hero--orange">
        <h1 className="admin-page-hero__title">Salas</h1>
        <p className="admin-page-hero__subtitle">
          Gestiona las salas del mini cine. Las salas inactivas no aparecen en la reserva pública.
        </p>
      </header>

      {error ? (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <MensajeAlerta>{error}</MensajeAlerta>
        </div>
      ) : null}
      {exito ? (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <MensajeAlerta tipo="exito">{exito}</MensajeAlerta>
        </div>
      ) : null}

      <div className="admin-toolbar">
        <Button type="button" variante="primario" onClick={abrirNueva}>
          Nueva sala
        </Button>
      </div>

      <div className="admin-form-panel admin-accent-border">
        <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.15rem' }}>
          {editandoId ? `Editar sala #${editandoId}` : 'Alta de sala'}
        </h2>
        <form onSubmit={enviarForm}>
          <div className="admin-form-grid">
            <Input
              etiqueta="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              required
              placeholder="Ej. Sala 1"
            />
            <Input
              etiqueta="Precio (S/)"
              name="precio"
              type="number"
              min={0}
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
              required
            />
            <Input
              etiqueta="Tiempo limpieza (min)"
              name="tiempo_limpieza"
              type="number"
              min={0}
              step={1}
              value={form.tiempo_limpieza}
              onChange={(e) =>
                setForm((f) => ({ ...f, tiempo_limpieza: e.target.value }))
              }
              required
            />
            <div className="mc-input-wrap">
              <label htmlFor="estadoSalaForm">Estado</label>
              <select
                id="estadoSalaForm"
                name="estado"
                className="mc-input"
                value={form.estado}
                onChange={(e) =>
                  setForm((f) => ({ ...f, estado: e.target.value }))
                }
              >
                <option value="disponible">Disponible (activa)</option>
                <option value="inactiva">Inactiva</option>
              </select>
            </div>
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
              {editandoId ? 'Guardar cambios' : 'Crear sala'}
            </Button>
            {editandoId ? (
              <Button type="button" variante="secundario" onClick={abrirNueva}>
                Cancelar edición
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.15rem' }}>
        Listado
      </h2>
      {cargando ? (
        <p style={{ color: 'var(--color-text-light)' }}>Cargando…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Limpieza (min)</th>
                <th>Estado</th>
                <th>Activa</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {lista.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>
                    <strong>{s.nombre}</strong>
                  </td>
                  <td>S/ {Number(s.precio ?? 0).toFixed(2)}</td>
                  <td>{s.tiempo_limpieza ?? '—'}</td>
                  <td>
                    <span
                      className={
                        s.estado === 'disponible'
                          ? 'admin-badge admin-badge--ok'
                          : 'admin-badge admin-badge--muted'
                      }
                    >
                      {s.estado}
                    </span>
                  </td>
                  <td>
                    <label className="admin-switch">
                      <input
                        type="checkbox"
                        checked={s.estado === 'disponible'}
                        disabled={toggleId === s.id}
                        onChange={() => alternarEstado(s)}
                        aria-label={`Activar sala ${s.nombre}`}
                      />
                      <span className="admin-switch__slider" />
                    </label>
                  </td>
                  <td>
                    <Button
                      type="button"
                      variante="opcion"
                      onClick={() => abrirEditar(s)}
                    >
                      Editar
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

import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  actualizarProductoConfiteria,
  cambiarEstadoProductoConfiteria,
  crearProductoConfiteria,
  eliminarProductoConfiteria,
  getAdminProductosConfiteria,
} from '../../api/api'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { MensajeAlerta } from '../../components/MensajeAlerta'
import { mensajeDesdeError } from '../../utils/erroresApi'

const formInicial = {
  nombre: '',
  descripcion: '',
  precio: '',
  imagen_url: '',
  estado: 'disponible',
  metadataJson: '',
}

export default function ConfiteriaAdmin() {
  const { token } = useOutletContext()
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [form, setForm] = useState(formInicial)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [toggleId, setToggleId] = useState(null)
  const [eliminandoId, setEliminandoId] = useState(null)

  const cargarLista = useCallback(async () => {
    setError('')
    try {
      const r = await getAdminProductosConfiteria(token)
      setLista(r?.datos?.productos ?? [])
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

  function abrirEditar(p) {
    setEditandoId(p.id)
    setForm({
      nombre: p.nombre ?? '',
      descripcion: p.descripcion ?? '',
      precio: p.precio != null ? String(p.precio) : '',
      imagen_url: p.imagen_url ?? '',
      estado: p.estado === 'agotado' ? 'agotado' : 'disponible',
      metadataJson:
        p.metadata && typeof p.metadata === 'object'
          ? JSON.stringify(p.metadata, null, 2)
          : '',
    })
    limpiarMensajes()
  }

  function parseMetadataField() {
    const raw = form.metadataJson.trim()
    if (!raw) return { ok: true, value: null }
    try {
      const parsed = JSON.parse(raw)
      if (parsed !== null && typeof parsed !== 'object') {
        return { ok: false, mensaje: 'Metadata debe ser un objeto JSON.' }
      }
      return { ok: true, value: parsed }
    } catch {
      return { ok: false, mensaje: 'Metadata: JSON no válido.' }
    }
  }

  async function enviarForm(e) {
    e.preventDefault()
    setGuardando(true)
    limpiarMensajes()

    const meta = parseMetadataField()
    if (!meta.ok) {
      setError(meta.mensaje)
      setGuardando(false)
      return
    }

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio: Number(form.precio),
      imagen_url: form.imagen_url.trim() || null,
      estado: form.estado,
      metadata: meta.value,
    }

    try {
      if (editandoId) {
        await actualizarProductoConfiteria(token, editandoId, payload)
        setExito('Producto actualizado correctamente.')
      } else {
        await crearProductoConfiteria(token, payload)
        setExito('Producto creado correctamente.')
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

  async function alternarEstado(p) {
    const siguiente = p.estado === 'disponible' ? 'agotado' : 'disponible'
    setToggleId(p.id)
    limpiarMensajes()
    try {
      await cambiarEstadoProductoConfiteria(token, p.id, siguiente)
      setExito(
        siguiente === 'disponible'
          ? 'Producto marcado como disponible.'
          : 'Producto marcado como agotado.'
      )
      await cargarLista()
    } catch (err) {
      setError(mensajeDesdeError(err))
    } finally {
      setToggleId(null)
    }
  }

  async function eliminar(p) {
    const ok = window.confirm(
      `¿Eliminar «${p.nombre}»? Esta acción no se puede deshacer.`
    )
    if (!ok) return

    setEliminandoId(p.id)
    limpiarMensajes()
    try {
      await eliminarProductoConfiteria(token, p.id)
      setExito('Producto eliminado.')
      if (editandoId === p.id) {
        abrirNueva()
      }
      await cargarLista()
    } catch (err) {
      setError(mensajeDesdeError(err))
    } finally {
      setEliminandoId(null)
    }
  }

  return (
    <div>
      <header className="admin-page-hero admin-page-hero--orange">
        <h1 className="admin-page-hero__title">Confitería</h1>
        <p className="admin-page-hero__subtitle">
          Los productos disponibles aparecen en el flujo público /confitería. Metadata opcional para combos o promociones (JSON).
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
          Nuevo producto
        </Button>
      </div>

      <div className="admin-form-panel admin-accent-border">
        <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.15rem' }}>
          {editandoId ? `Editar producto #${editandoId}` : 'Alta de producto'}
        </h2>
        <form onSubmit={enviarForm}>
          <div className="admin-form-grid">
            <Input
              etiqueta="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              required
              placeholder="Ej. Popcorn mediano"
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
            <div className="mc-input-wrap" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="descProd">Descripción</label>
              <textarea
                id="descProd"
                name="descripcion"
                className="mc-input"
                rows={2}
                value={form.descripcion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descripcion: e.target.value }))
                }
                placeholder="Opcional"
              />
            </div>
            <Input
              etiqueta="URL imagen"
              name="imagen_url"
              value={form.imagen_url}
              onChange={(e) => setForm((f) => ({ ...f, imagen_url: e.target.value }))}
              placeholder="https://…"
            />
            <div className="mc-input-wrap">
              <label htmlFor="estadoProdForm">Estado catálogo</label>
              <select
                id="estadoProdForm"
                name="estado"
                className="mc-input"
                value={form.estado}
                onChange={(e) =>
                  setForm((f) => ({ ...f, estado: e.target.value }))
                }
              >
                <option value="disponible">Disponible</option>
                <option value="agotado">Agotado</option>
              </select>
            </div>
            <div className="mc-input-wrap" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="metaProd">Metadata (JSON opcional)</label>
              <textarea
                id="metaProd"
                name="metadataJson"
                className="mc-input"
                rows={4}
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                value={form.metadataJson}
                onChange={(e) =>
                  setForm((f) => ({ ...f, metadataJson: e.target.value }))
                }
                placeholder={`{\n  "tipo": "combo",\n  "items": ["canchita", "bebida"]\n}`}
              />
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
              {editandoId ? 'Guardar cambios' : 'Crear producto'}
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
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Venta</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id}>
                  <td style={{ width: '72px' }}>
                    <div
                      style={{
                        width: 56,
                        height: 42,
                        borderRadius: 6,
                        overflow: 'hidden',
                        background: 'rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                      }}
                    >
                      {p.imagen_url ? (
                        <img
                          src={p.imagen_url}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <span aria-hidden style={{ opacity: 0.35 }}>
                          🍿
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>{p.nombre}</strong>
                    {p.descripcion ? (
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--color-text-light)',
                          marginTop: 4,
                          maxWidth: 280,
                        }}
                      >
                        {p.descripcion}
                      </div>
                    ) : null}
                  </td>
                  <td>S/ {Number(p.precio ?? 0).toFixed(2)}</td>
                  <td>
                    <span
                      className={
                        p.estado === 'disponible'
                          ? 'admin-badge admin-badge--ok'
                          : 'admin-badge admin-badge--danger'
                      }
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td>
                    <label className="admin-switch">
                      <input
                        type="checkbox"
                        checked={p.estado === 'disponible'}
                        disabled={toggleId === p.id}
                        onChange={() => alternarEstado(p)}
                        aria-label={`Disponible ${p.nombre}`}
                      />
                      <span className="admin-switch__slider" />
                    </label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <Button
                        type="button"
                        variante="opcion"
                        onClick={() => abrirEditar(p)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variante="opcion"
                        disabled={eliminandoId === p.id}
                        onClick={() => eliminar(p)}
                      >
                        {eliminandoId === p.id ? '…' : 'Eliminar'}
                      </Button>
                    </div>
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

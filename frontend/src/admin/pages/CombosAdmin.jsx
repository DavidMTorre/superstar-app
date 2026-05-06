import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  actualizarComboConfiteria,
  crearComboConfiteria,
  eliminarComboConfiteria,
  getAdminCombos,
  getAdminProductosConfiteria,
} from '../../api/api'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { MensajeAlerta } from '../../components/MensajeAlerta'
import { mensajeDesdeError } from '../../utils/erroresApi'

const lineaVacia = () => ({ producto_id: '', cantidad: '1' })

const formInicial = () => ({
  nombre: '',
  precio: '',
  estado: 'disponible',
  lineas: [lineaVacia()],
})

export default function CombosAdmin() {
  const { token } = useOutletContext()
  const [lista, setLista] = useState([])
  const [catalogoProductos, setCatalogoProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [form, setForm] = useState(formInicial)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState(null)

  const cargarLista = useCallback(async () => {
    setError('')
    try {
      const [r, prod] = await Promise.all([
        getAdminCombos(token),
        getAdminProductosConfiteria(token),
      ])
      setLista(r?.datos?.combos ?? [])
      setCatalogoProductos(prod?.datos?.productos ?? [])
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
    setForm(formInicial())
    limpiarMensajes()
  }

  function abrirEditar(c) {
    setEditandoId(c.id)
    setForm({
      nombre: c.nombre ?? '',
      precio: c.precio != null ? String(c.precio) : '',
      estado: c.estado === 'agotado' ? 'agotado' : 'disponible',
      lineas:
        (c.productos || []).length > 0
          ? (c.productos || []).map((p) => ({
              producto_id: String(p.id),
              cantidad: String(p.cantidad ?? 1),
            }))
          : [lineaVacia()],
    })
    limpiarMensajes()
  }

  function actualizarLinea(i, campo, valor) {
    setForm((f) => {
      const lineas = [...f.lineas]
      lineas[i] = { ...lineas[i], [campo]: valor }
      return { ...f, lineas }
    })
  }

  function agregarLinea() {
    setForm((f) => ({ ...f, lineas: [...f.lineas, lineaVacia()] }))
  }

  function quitarLinea(i) {
    setForm((f) => ({
      ...f,
      lineas: f.lineas.filter((_, j) => j !== i),
    }))
  }

  async function enviarForm(e) {
    e.preventDefault()
    setGuardando(true)
    limpiarMensajes()

    const productosPayload = form.lineas
      .filter((l) => l.producto_id !== '')
      .map((l) => ({
        producto_id: Number(l.producto_id),
        cantidad: Number(l.cantidad),
      }))

    if (productosPayload.length === 0) {
      setError('Añade al menos un producto al combo.')
      setGuardando(false)
      return
    }

    const payload = {
      nombre: form.nombre.trim(),
      precio: Number(form.precio),
      estado: form.estado,
      productos: productosPayload,
    }

    try {
      if (editandoId) {
        await actualizarComboConfiteria(token, editandoId, payload)
        setExito('Combo actualizado correctamente.')
      } else {
        await crearComboConfiteria(token, payload)
        setExito('Combo creado correctamente.')
      }
      setEditandoId(null)
      setForm(formInicial())
      await cargarLista()
    } catch (err) {
      setError(mensajeDesdeError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(c) {
    const ok = window.confirm(`¿Eliminar el combo «${c.nombre}»?`)
    if (!ok) return
    setEliminandoId(c.id)
    limpiarMensajes()
    try {
      await eliminarComboConfiteria(token, c.id)
      setExito('Combo eliminado.')
      if (editandoId === c.id) abrirNueva()
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
        <h1 className="admin-page-hero__title">Combos</h1>
        <p className="admin-page-hero__subtitle">
          Define packs con varios productos y un precio único. Se guardan en la tabla{' '}
          <code>combos</code> (sin usar metadata).
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
          Nuevo combo
        </Button>
      </div>

      <div className="admin-form-panel admin-accent-border">
        <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.15rem' }}>
          {editandoId ? `Editar combo #${editandoId}` : 'Alta de combo'}
        </h2>
        <form onSubmit={enviarForm}>
          <div className="admin-form-grid">
            <Input
              etiqueta="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              required
            />
            <Input
              etiqueta="Precio combo (S/)"
              name="precio"
              type="number"
              min={0}
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
              required
            />
            <div className="mc-input-wrap">
              <label htmlFor="estadoCombo">Estado</label>
              <select
                id="estadoCombo"
                name="estado"
                className="mc-input"
                value={form.estado}
                onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
              >
                <option value="disponible">Disponible</option>
                <option value="agotado">Agotado</option>
              </select>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', margin: 'var(--space-lg) 0 var(--space-sm)' }}>
            Productos incluidos
          </h3>
          {form.lineas.map((linea, i) => (
            <div
              key={i}
              className="admin-form-grid"
              style={{ marginBottom: 'var(--space-md)', alignItems: 'flex-end' }}
            >
              <div className="mc-input-wrap">
                <label htmlFor={`prod-${i}`}>Producto</label>
                <select
                  id={`prod-${i}`}
                  className="mc-input"
                  value={linea.producto_id}
                  onChange={(e) => actualizarLinea(i, 'producto_id', e.target.value)}
                  required={i === 0}
                >
                  <option value="">— Elegir —</option>
                  {catalogoProductos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (S/ {Number(p.precio).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <Input
                etiqueta="Cantidad"
                name={`cant-${i}`}
                type="number"
                min={1}
                step={1}
                value={linea.cantidad}
                onChange={(e) => actualizarLinea(i, 'cantidad', e.target.value)}
                required
              />
              <Button
                type="button"
                variante="secundario"
                disabled={form.lineas.length <= 1}
                onClick={() => quitarLinea(i)}
              >
                Quitar
              </Button>
            </div>
          ))}
          <Button type="button" variante="opcion" onClick={agregarLinea}>
            + Añadir producto
          </Button>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-md)',
              marginTop: 'var(--space-lg)',
            }}
          >
            <Button type="submit" variante="primario" cargando={guardando}>
              {editandoId ? 'Guardar cambios' : 'Crear combo'}
            </Button>
            {editandoId ? (
              <Button type="button" variante="secundario" onClick={abrirNueva}>
                Cancelar edición
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      <h2 style={{ marginBottom: 'var(--space-md)', fontSize: '1.15rem' }}>Listado</h2>
      {cargando ? (
        <p style={{ color: 'var(--color-text-light)' }}>Cargando…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Incluye</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.nombre}</strong>
                  </td>
                  <td>S/ {Number(c.precio ?? 0).toFixed(2)}</td>
                  <td style={{ fontSize: '0.85rem', maxWidth: 320 }}>
                    {(c.productos || []).map((p) => (
                      <span key={p.id} style={{ display: 'inline-block', marginRight: 8 }}>
                        {p.cantidad}× {p.nombre}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span
                      className={
                        c.estado === 'disponible'
                          ? 'admin-badge admin-badge--ok'
                          : 'admin-badge admin-badge--danger'
                      }
                    >
                      {c.estado}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <Button type="button" variante="opcion" onClick={() => abrirEditar(c)}>
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variante="opcion"
                        disabled={eliminandoId === c.id}
                        onClick={() => eliminar(c)}
                      >
                        {eliminandoId === c.id ? '…' : 'Eliminar'}
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

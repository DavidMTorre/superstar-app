import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  agregarProductosConfiteria,
  getCombosConfiteria,
  getProductosConfiteria,
} from '../api/api'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { mensajeDesdeError } from '../utils/erroresApi'

export default function ConfiteriaPage() {
  const ubicacion = useLocation()
  const navegar = useNavigate()

  const codigoReserva = ubicacion.state?.codigoReserva ?? ''
  const resumen = ubicacion.state?.resumen ?? null

  const [catalogo, setCatalogo] = useState([])
  const [combos, setCombos] = useState([])
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true)
  /** @type {Record<number, number>} */
  const [cantidades, setCantidades] = useState({})
  /** @type {Record<number, number>} */
  const [comboCantidades, setComboCantidades] = useState({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!codigoReserva) {
      navegar('/cartelera', { replace: true })
    }
  }, [codigoReserva, navegar])

  useEffect(() => {
    let cancelado = false
    ;(async () => {
      setCargandoCatalogo(true)
      setError('')
      try {
        const [prod, comb] = await Promise.all([
          getProductosConfiteria(),
          getCombosConfiteria(),
        ])
        if (!cancelado) {
          setCatalogo(prod)
          setCombos(comb)
        }
      } catch (err) {
        if (!cancelado) setError(mensajeDesdeError(err))
      } finally {
        if (!cancelado) setCargandoCatalogo(false)
      }
    })()
    return () => {
      cancelado = true
    }
  }, [])

  const precioProducto = useMemo(() => {
    /** @type {Record<number, number>} */
    const m = {}
    for (const p of catalogo) {
      m[p.id] = Number(p.precio)
    }
    return m
  }, [catalogo])

  function cantidadDe(productoId) {
    return cantidades[productoId] ?? 0
  }

  function cantidadCombo(comboId) {
    return comboCantidades[comboId] ?? 0
  }

  function ajustar(productoId, delta) {
    setCantidades((prev) => {
      const actual = prev[productoId] ?? 0
      const siguiente = Math.max(0, actual + delta)
      const next = { ...prev }
      if (siguiente === 0) {
        delete next[productoId]
      } else {
        next[productoId] = siguiente
      }
      return next
    })
  }

  function ajustarCombo(comboId, delta) {
    setComboCantidades((prev) => {
      const actual = prev[comboId] ?? 0
      const siguiente = Math.max(0, actual + delta)
      const next = { ...prev }
      if (siguiente === 0) {
        delete next[comboId]
      } else {
        next[comboId] = siguiente
      }
      return next
    })
  }

  const lineasProductos = useMemo(() => {
    return Object.entries(cantidades)
      .filter(([, c]) => c > 0)
      .map(([id, c]) => ({
        producto_id: Number(id),
        cantidad: c,
      }))
  }, [cantidades])

  const lineasCombos = useMemo(() => {
    return Object.entries(comboCantidades)
      .filter(([, c]) => c > 0)
      .map(([id, c]) => ({
        combo_id: Number(id),
        cantidad: c,
      }))
  }, [comboCantidades])

  const subtotalProductos = useMemo(() => {
    let s = 0
    for (const p of catalogo) {
      const n = cantidadDe(p.id)
      if (n > 0) s += Number(p.precio) * n
    }
    return Math.round(s * 100) / 100
  }, [catalogo, cantidades])

  const subtotalCombosPrecio = useMemo(() => {
    let s = 0
    for (const c of combos) {
      const n = cantidadCombo(c.id)
      if (n > 0) s += Number(c.precio) * n
    }
    return Math.round(s * 100) / 100
  }, [combos, comboCantidades])

  /** Ahorro estimado vs comprar ítems por separado (solo referencia). */
  const ahorroCombos = useMemo(() => {
    let a = 0
    for (const c of combos) {
      const n = cantidadCombo(c.id)
      if (n <= 0) continue
      let catalogoSum = 0
      for (const line of c.productos || []) {
        const pu = precioProducto[line.id] ?? 0
        catalogoSum += pu * Number(line.cantidad)
      }
      const diff = Math.max(0, catalogoSum - Number(c.precio))
      a += diff * n
    }
    return Math.round(a * 100) / 100
  }, [combos, comboCantidades, precioProducto])

  const subtotalConfiteria = useMemo(
    () => Math.round((subtotalProductos + subtotalCombosPrecio) * 100) / 100,
    [subtotalProductos, subtotalCombosPrecio]
  )

  const precioReserva = Number(resumen?.precio_total ?? 0)
  const totalEstimado = Math.round((precioReserva + subtotalConfiteria) * 100) / 100

  function irAPago(extraState = {}) {
    navegar('/pago', {
      state: {
        codigoReserva,
        resumen,
        subtotalConfiteria: extraState.subtotalConfiteria ?? 0,
        totalPagar: extraState.totalPagar ?? precioReserva,
      },
    })
  }

  async function continuarAlPago(e) {
    e.preventDefault()
    setError('')

    if (lineasProductos.length === 0 && lineasCombos.length === 0) {
      irAPago({
        subtotalConfiteria: 0,
        totalPagar: precioReserva,
      })
      return
    }

    setEnviando(true)
    try {
      const respuesta = await agregarProductosConfiteria({
        codigo_reserva: codigoReserva,
        productos: lineasProductos,
        combos: lineasCombos,
      })
      const d = respuesta?.datos
      navegar('/pago', {
        state: {
          codigoReserva,
          resumen,
          subtotalConfiteria: Number(d?.subtotal_confiteria ?? subtotalConfiteria),
          totalPagar: Number(d?.total ?? totalEstimado),
        },
      })
    } catch (err) {
      setError(mensajeDesdeError(err))
    } finally {
      setEnviando(false)
    }
  }

  if (!codigoReserva) {
    return null
  }

  const sinCatalogo =
    !cargandoCatalogo && catalogo.length === 0 && combos.length === 0

  return (
    <div className="mx-auto max-w-6xl pb-6 pt-2">
      <p className="mb-4">
        <Link
          to="/cartelera"
          className="text-sm font-medium text-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
        >
          ← Inicio
        </Link>
      </p>

      <div className="mc-form-panel !max-w-none border border-[var(--color-border-subtle)] bg-[var(--color-card)]/90 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight">Confitería</h1>
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          Combos y productos sueltos. El pago incluirá entrada + confitería.
        </p>

        {error ? <MensajeAlerta>{error}</MensajeAlerta> : null}

        {cargandoCatalogo ? (
          <p className="mc-reserva-ayuda">Cargando catálogo…</p>
        ) : null}

        {sinCatalogo ? (
          <p
            style={{
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0,0,0,0.04)',
              fontSize: '0.9rem',
              marginBottom: 'var(--space-md)',
            }}
          >
            No hay productos ni combos disponibles. Puedes continuar al pago de tu entrada.
          </p>
        ) : null}

        {!cargandoCatalogo && combos.length > 0 ? (
          <>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-md)' }}>Combos</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-xl)',
              }}
            >
              {combos.map((c) => {
                const cant = cantidadCombo(c.id)
                const catSum = (c.productos || []).reduce((acc, line) => {
                  const pu = precioProducto[line.id] ?? 0
                  return acc + pu * Number(line.cantidad)
                }, 0)
                const ahorroUnit = Math.max(0, Math.round((catSum - Number(c.precio)) * 100) / 100)

                return (
                  <Card key={c.id} className="mc-card--combo">
                    <div style={{ marginBottom: 'var(--space-sm)' }}>
                      <span className="mc-badge-combo">Combo</span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem' }}>{c.nombre}</h3>
                    <p style={{ fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                      S/ {Number(c.precio).toFixed(2)}
                      {ahorroUnit > 0 ? (
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            color: 'var(--color-success, #28c76f)',
                            marginTop: 4,
                          }}
                        >
                          Ahorro vs ítems sueltos: ~S/ {ahorroUnit.toFixed(2)} / unidad
                        </span>
                      ) : null}
                    </p>
                    <ul
                      style={{
                        margin: '0 0 var(--space-md)',
                        paddingLeft: '1.15rem',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-light)',
                      }}
                    >
                      {(c.productos || []).map((p) => (
                        <li key={`${c.id}-${p.id}`}>
                          {p.cantidad}× {p.nombre}
                        </li>
                      ))}
                    </ul>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Button
                        type="button"
                        variante="opcion"
                        aria-label={`Menos ${c.nombre}`}
                        onClick={() => ajustarCombo(c.id, -1)}
                        disabled={cant === 0}
                      >
                        −
                      </Button>
                      <span style={{ minWidth: '2ch', textAlign: 'center', fontWeight: 600 }}>
                        {cant}
                      </span>
                      <Button
                        type="button"
                        variante="opcion"
                        aria-label={`Más ${c.nombre}`}
                        onClick={() => ajustarCombo(c.id, 1)}
                      >
                        +
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        ) : null}

        {!cargandoCatalogo && catalogo.length > 0 ? (
          <>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-md)' }}>Productos</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-lg)',
              }}
            >
              {catalogo.map((p) => {
                const cant = cantidadDe(p.id)
                return (
                  <Card key={p.id}>
                    <div
                      style={{
                        aspectRatio: '4/3',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(0,0,0,0.06)',
                        marginBottom: 'var(--space-sm)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {p.imagen_url ? (
                        <img
                          src={p.imagen_url}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '2rem', opacity: 0.35 }} aria-hidden>
                          🍿
                        </span>
                      )}
                    </div>
                    <h2 style={{ fontSize: '1rem', margin: '0 0 0.35rem' }}>{p.nombre}</h2>
                    {p.descripcion ? (
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--color-text-light)',
                          margin: '0 0 var(--space-sm)',
                          minHeight: '2.4em',
                        }}
                      >
                        {p.descripcion}
                      </p>
                    ) : null}
                    <p style={{ fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                      S/ {Number(p.precio).toFixed(2)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Button
                        type="button"
                        variante="opcion"
                        aria-label={`Menos ${p.nombre}`}
                        onClick={() => ajustar(p.id, -1)}
                        disabled={cant === 0}
                      >
                        −
                      </Button>
                      <span style={{ minWidth: '2ch', textAlign: 'center', fontWeight: 600 }}>
                        {cant}
                      </span>
                      <Button
                        type="button"
                        variante="opcion"
                        aria-label={`Más ${p.nombre}`}
                        onClick={() => ajustar(p.id, 1)}
                      >
                        +
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        ) : null}

        <section
          className="mb-6 rounded-xl border border-[var(--color-border-subtle)] bg-[rgba(255,122,0,0.06)] p-4 md:p-5"
        >
          <h2 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)' }}>Resumen</h2>
          <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
            Entrada: <strong>S/ {precioReserva.toFixed(2)}</strong>
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
            Productos (estim.): <strong>S/ {subtotalProductos.toFixed(2)}</strong>
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>
            Combos (estim.): <strong>S/ {subtotalCombosPrecio.toFixed(2)}</strong>
          </p>
          {ahorroCombos > 0 ? (
            <p
              style={{
                margin: '0.25rem 0',
                fontSize: '0.85rem',
                color: 'var(--color-success, #28c76f)',
              }}
            >
              Ahorro estimado en combos: ~S/ {ahorroCombos.toFixed(2)}
            </p>
          ) : null}
          <p
            style={{
              margin: 'var(--space-sm) 0 0',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--color-primary-dark)',
            }}
          >
            Total estimado: S/ {totalEstimado.toFixed(2)}
          </p>
          {lineasCombos.length > 0 || lineasProductos.length > 0 ? (
            <ul
              style={{
                margin: 'var(--space-sm) 0 0',
                paddingLeft: '1.25rem',
                fontSize: '0.85rem',
              }}
            >
              {combos
                .filter((c) => cantidadCombo(c.id) > 0)
                .map((c) => (
                  <li key={`r-${c.id}`}>
                    Combo {c.nombre} × {cantidadCombo(c.id)} — S/{' '}
                    {(Number(c.precio) * cantidadCombo(c.id)).toFixed(2)}
                  </li>
                ))}
              {catalogo
                .filter((p) => cantidadDe(p.id) > 0)
                .map((p) => (
                  <li key={`rp-${p.id}`}>
                    {p.nombre} × {cantidadDe(p.id)} — S/{' '}
                    {(Number(p.precio) * cantidadDe(p.id)).toFixed(2)}
                  </li>
                ))}
            </ul>
          ) : (
            <p style={{ margin: 'var(--space-sm) 0 0', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
              Sin selección aún.
            </p>
          )}
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <Button
            type="button"
            variante="secundario"
            anchoCompleto
            onClick={() =>
              irAPago({
                subtotalConfiteria: 0,
                totalPagar: precioReserva,
              })
            }
          >
            Saltar confitería
          </Button>
          <Button
            type="button"
            variante="primario"
            anchoCompleto
            cargando={enviando}
            onClick={continuarAlPago}
          >
            Continuar al pago
          </Button>
        </div>
      </div>
    </div>
  )
}

import { Play, Sparkles, Star, Ticket } from 'lucide-react'
import { CarteleraBusqueda } from '../components/cartelera/CarteleraBusqueda'
import { CarteleraErrorInicial } from '../components/cartelera/CarteleraErrorInicial'
import { CarteleraFilaStreaming } from '../components/cartelera/CarteleraFilaStreaming'
import { CarteleraGrillaPeliculas } from '../components/cartelera/CarteleraGrillaPeliculas'
import { CarteleraHero } from '../components/cartelera/CarteleraHero'
import { Cargando } from '../components/Cargando'
import { MensajeAlerta } from '../components/MensajeAlerta'
import { useCarteleraData } from '../hooks/useCarteleraData'

export default function CarteleraPage() {
  const {
    porCategoria,
    peliculasLista,
    cargando,
    cargaInicial,
    error,
    hayBusqueda,
    categoriasOrdenadas,
    sinPeliculasNiCategorias,
    heroPelicula,
    estrenos,
    masReservadas,
    recomendadas,
    proximamente,
    onCambioBusqueda,
    busqueda,
    todasOrden,
  } = useCarteleraData()

  if (cargaInicial && cargando) {
    return <Cargando mensaje="Cargando cartelera…" />
  }

  if (error && sinPeliculasNiCategorias) {
    return <CarteleraErrorInicial mensaje={error} />
  }

  return (
    <div className="pb-4">
      {!hayBusqueda && heroPelicula ? <CarteleraHero pelicula={heroPelicula} /> : null}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-extrabold tracking-tight md:text-3xl">Cartelera</h1>
          <p className="mb-0 text-sm text-[var(--color-text-muted)] md:text-base">
            Busca por título o explora nuestras colecciones.
          </p>
        </div>
      </div>

      <CarteleraBusqueda valor={busqueda} onCambio={onCambioBusqueda} />

      {cargando ? (
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">Actualizando…</p>
      ) : null}

      {error && !cargando ? (
        <div className="mb-4">
          <MensajeAlerta>{error}</MensajeAlerta>
        </div>
      ) : null}

      {hayBusqueda ? (
        <>
          <h2 className="mb-4 text-lg font-bold">Resultados</h2>
          {!cargando && peliculasLista.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-card)]/50 p-8 text-center text-[var(--color-text-muted)]">
              No hay películas que coincidan con «{busqueda.trim()}».
            </p>
          ) : null}
          {peliculasLista.length > 0 ? <CarteleraGrillaPeliculas peliculas={peliculasLista} /> : null}
        </>
      ) : (
        <>
          {todasOrden.length > 0 ? (
            <>
              <CarteleraFilaStreaming
                titulo="Estrenos"
                subtitulo="Lo más reciente en cartelera"
                icon={Sparkles}
                peliculas={estrenos}
              />
              <CarteleraFilaStreaming
                titulo="Más reservadas"
                subtitulo="Funciones con mayor demanda"
                icon={Ticket}
                peliculas={masReservadas}
              />
              <CarteleraFilaStreaming
                titulo="Recomendadas para ti"
                subtitulo="Selección editorial Superstar"
                icon={Star}
                peliculas={recomendadas}
              />
              <CarteleraFilaStreaming
                titulo="Próximamente"
                subtitulo="No te pierdas estos estrenos"
                icon={Play}
                peliculas={proximamente}
              />
            </>
          ) : null}

          <section className="mt-4" id="catalogo">
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text)] md:text-xl">Por categoría</h2>
            <p className="mb-6 text-sm text-[var(--color-text-muted)]">
              Explora el catálogo organizado por género o temática.
            </p>
            {categoriasOrdenadas.length === 0 && !cargando ? (
              <p className="text-[var(--color-text-muted)]">No hay películas disponibles por ahora.</p>
            ) : null}
            {categoriasOrdenadas.map((nombreCat) => (
              <section key={nombreCat} className="mc-seccion-categoria">
                <h2>{nombreCat}</h2>
                <CarteleraGrillaPeliculas peliculas={porCategoria?.[nombreCat]} />
              </section>
            ))}
          </section>
        </>
      )}
    </div>
  )
}

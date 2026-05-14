import { motion } from 'framer-motion'
import { CARTELERA_CONTAINER_VARIANTS } from '../../constants/carteleraMotion'
import { CarteleraFilaTitulo } from './CarteleraFilaTitulo'
import { CarteleraTarjetaPelicula } from './CarteleraTarjetaPelicula'

export function CarteleraFilaStreaming({ titulo, subtitulo, icon, peliculas }) {
  const lista = Array.isArray(peliculas) ? peliculas : []
  if (lista.length === 0) return null

  return (
    <section className="mb-10 md:mb-14">
      <CarteleraFilaTitulo icon={icon} titulo={titulo} subtitulo={subtitulo} />
      <motion.div
        variants={CARTELERA_CONTAINER_VARIANTS}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] md:-mx-6 md:px-6 lg:-mx-8 lg:px-8"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {lista.map((pelicula) => (
          <CarteleraTarjetaPelicula key={pelicula?.id} pelicula={pelicula} />
        ))}
      </motion.div>
    </section>
  )
}

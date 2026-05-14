import { motion } from 'framer-motion'
import { CARTELERA_CONTAINER_VARIANTS } from '../../constants/carteleraMotion'
import { CarteleraTarjetaPelicula } from './CarteleraTarjetaPelicula'

export function CarteleraGrillaPeliculas({ peliculas }) {
  const lista = Array.isArray(peliculas) ? peliculas : []
  return (
    <motion.div
      variants={CARTELERA_CONTAINER_VARIANTS}
      initial="hidden"
      animate="show"
      className="mc-grid-peliculas"
    >
      {lista.map((pelicula) => (
        <CarteleraTarjetaPelicula key={pelicula?.id} pelicula={pelicula} />
      ))}
    </motion.div>
  )
}

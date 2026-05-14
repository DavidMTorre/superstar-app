import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '../Card'
import { CARTELERA_ITEM_VARIANTS } from '../../constants/carteleraMotion'

export const CarteleraTarjetaPelicula = memo(function CarteleraTarjetaPelicula({ pelicula }) {
  const titulo = pelicula?.titulo || 'Sin título'
  const imagen = pelicula?.imagen_url

  return (
    <motion.div
      variants={CARTELERA_ITEM_VARIANTS}
      className="shrink-0 snap-start"
      style={{ width: 'min(42vw, 200px)' }}
    >
      <Card interactiva className="h-full overflow-hidden">
        <Link to={`/reserva/${pelicula?.id}`} className="block text-inherit no-underline">
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-t-[inherit]"
          >
            {imagen ? (
              <img
                src={imagen}
                alt=""
                className="aspect-[2/3] w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="mc-placeholder-img aspect-[2/3]">{titulo}</div>
            )}
          </motion.div>
          <div className="mc-card__body">
            <h3 className="mc-card__titulo line-clamp-2 min-h-[2.5rem] text-[0.9rem] leading-snug">
              {titulo}
            </h3>
            <p className="mb-0 mt-1 text-[0.75rem] text-[var(--color-text-muted)]">
              {pelicula?.duracion ? `${pelicula.duracion} min` : '\u00a0'}
            </p>
          </div>
        </Link>
      </Card>
    </motion.div>
  )
})

import { Search } from 'lucide-react'
import { cn } from '../../lib/cn'

export function CarteleraBusqueda({ valor, onCambio }) {
  return (
    <div className="relative mb-8 max-w-xl">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
        aria-hidden
      />
      <label htmlFor="buscarPelicula" className="sr-only">
        Buscar película
      </label>
      <input
        id="buscarPelicula"
        type="search"
        className={cn(
          'mc-input w-full rounded-xl py-3 pl-11 pr-4',
          'border-[var(--color-border-subtle)] bg-[var(--color-card)]/90',
        )}
        placeholder="Buscar por título…"
        value={valor}
        onChange={onCambio}
        autoComplete="off"
      />
    </div>
  )
}

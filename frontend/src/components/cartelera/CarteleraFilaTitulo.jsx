export function CarteleraFilaTitulo({ icon: Icon, titulo, subtitulo }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div className="flex items-center gap-2">
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(255,122,0,0.12)] text-[var(--color-primary-light)] shadow-[0_0_20px_rgba(255,122,0,0.12)]">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <div>
          <h2 className="mb-0 text-lg font-bold tracking-tight text-[var(--color-text)] md:text-xl">
            {titulo}
          </h2>
          {subtitulo ? (
            <p className="mb-0 mt-0.5 text-xs text-[var(--color-text-muted)] md:text-sm">{subtitulo}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

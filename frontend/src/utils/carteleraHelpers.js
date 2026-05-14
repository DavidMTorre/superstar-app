/** Películas únicas por orden de aparición en categorías. */
export function peliculasUnicasPorOrden(porCategoria, categoriasOrdenadas) {
  const vista = new Map()
  for (const nombreCat of categoriasOrdenadas) {
    const lista = porCategoria?.[nombreCat]
    if (!Array.isArray(lista)) continue
    for (const p of lista) {
      const id = p?.id
      if (id == null || vista.has(id)) continue
      vista.set(id, { ...p, _categoria: nombreCat })
    }
  }
  return [...vista.values()]
}

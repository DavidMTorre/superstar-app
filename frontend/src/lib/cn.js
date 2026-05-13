/** Une clases CSS omitiendo valores falsy (Sonar: sin dependencias extra). */
export function cn(...clases) {
  return clases.filter(Boolean).join(' ')
}

import { motion } from 'framer-motion'
import { Armchair, CalendarDays, Clock } from 'lucide-react'
import { Button } from '../Button'
import { Input } from '../Input'
import { MensajeAlerta } from '../MensajeAlerta'
import { ReservaChipHorario } from './ReservaChipHorario'
import { ReservaProgresoPasos } from './ReservaProgresoPasos'
import { ReservaTarjetaSala } from './ReservaTarjetaSala'
import {
  claveSlotHorario,
  fechaMinimaHoy,
  mismoHorarioSeleccion,
} from '../../utils/reservaHelpers'

/**
 * Formulario de reserva (fecha, salas, horarios, resumen, personas).
 * Toda la UI y textos coinciden con la implementación anterior.
 */
export function ReservaFormularioContenido({
  error,
  pasoActual,
  tieneFecha,
  tieneSala,
  tieneHorario,
  fecha,
  fechaBonita,
  loading,
  onCambioFecha,
  salas,
  salaSeleccionada,
  horariosFiltrados,
  horarioSeleccionado,
  conteoPorSala,
  precioPorSala,
  onSeleccionarSala,
  onSeleccionarHorario,
  tituloPelicula,
  fechaResumen,
  usuario,
  cantidadPersonas,
  onCambioCantidadPersonas,
  onSubmit,
  puedeEnviar,
  enviando,
}) {
  return (
    <>
      <ReservaProgresoPasos
        pasoActual={pasoActual}
        tieneFecha={tieneFecha}
        tieneSala={tieneSala}
        tieneHorario={tieneHorario}
      />

      {error ? <MensajeAlerta>{error}</MensajeAlerta> : null}

      <form id="formulario-reserva" onSubmit={onSubmit} className="relative">
        <section className="mc-reserva-bloque">
          <h2 className="mc-reserva-bloque__titulo flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[var(--color-primary-light)]" aria-hidden />
            Fecha de la función
          </h2>
          <Input
            etiqueta="Selecciona el día"
            name="fecha"
            type="date"
            min={fechaMinimaHoy()}
            value={fecha}
            onChange={onCambioFecha}
            required
            inputClassName="mc-reserva-fecha-input"
          />
          {fecha ? (
            <p className="mt-2 rounded-lg border border-[var(--color-border-subtle)] bg-[rgba(255,122,0,0.06)] px-3 py-2 text-sm capitalize leading-snug text-[var(--color-text-light)]">
              <span className="font-semibold text-[var(--color-text)]">{fechaBonita}</span>
            </p>
          ) : null}
          {!fecha && !loading ? (
            <p className="mc-reserva-ayuda">Selecciona una fecha</p>
          ) : null}
        </section>

        <section className="mc-reserva-bloque">
          <h2 className="mc-reserva-bloque__titulo flex items-center gap-2">
            <Armchair className="h-5 w-5 text-[var(--color-primary-light)]" aria-hidden />
            Salas disponibles
          </h2>
          {loading ? (
            <p className="mc-reserva-loading mc-reserva-ayuda">Cargando disponibilidad…</p>
          ) : null}

          {!loading && fecha && !error && salas.length === 0 ? (
            <p className="mc-reserva-ayuda">No hay disponibilidad</p>
          ) : null}

          {!loading && salas.length > 0 ? (
            <>
              <p className="mb-4 flex flex-wrap gap-4 text-[11px] text-[var(--color-text-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-text-muted)]" aria-hidden />
                  Disponible
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary-glow)]"
                    aria-hidden
                  />
                  Tu sala
                </span>
              </p>
              <div className="mc-reserva-grid-salas">
                {salas.map((sala) => {
                  const activa = salaSeleccionada?.sala_id === sala.sala_id
                  const n = conteoPorSala.get(sala.sala_id) ?? 0
                  const precio = precioPorSala.get(sala.sala_id)
                  return (
                    <ReservaTarjetaSala
                      key={sala.sala_id}
                      sala={sala}
                      activa={activa}
                      numFunciones={n}
                      precioDesde={precio}
                      onSeleccionar={onSeleccionarSala}
                    />
                  )
                })}
              </div>
            </>
          ) : null}
        </section>

        {salaSeleccionada ? (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mc-reserva-bloque"
          >
            <h2 className="mc-reserva-bloque__titulo flex flex-wrap items-center gap-2">
              <Clock className="h-5 w-5 text-[var(--color-primary-light)]" aria-hidden />
              Horarios
              <span className="text-sm font-medium text-[var(--color-text-muted)]">
                · {salaSeleccionada.sala}
              </span>
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {horariosFiltrados.map((h) => {
                const activo = mismoHorarioSeleccion(horarioSeleccionado, h)
                return (
                  <ReservaChipHorario
                    key={claveSlotHorario(h)}
                    slot={h}
                    activo={activo}
                    onSeleccionar={onSeleccionarHorario}
                  />
                )
              })}
            </div>
          </motion.section>
        ) : null}

        {horarioSeleccionado && fechaResumen ? (
          <section className="mc-reserva-bloque mc-reserva-bloque--resumen">
            <h2 className="mc-reserva-bloque__titulo">Resumen</h2>
            <div className="mc-reserva-resumen-card">
              <p className="m-0">
                <strong>Película:</strong> {tituloPelicula}
              </p>
              <p className="mt-[0.35rem] mb-0">
                <strong>Sala:</strong> {horarioSeleccionado.sala}
              </p>
              <p className="mt-[0.35rem] mb-0">
                <strong>Fecha:</strong> {fechaResumen}
              </p>
              <p className="mt-[0.35rem] mb-0">
                <strong>Horario:</strong> {horarioSeleccionado.hora_inicio} –{' '}
                {horarioSeleccionado.hora_fin}
              </p>
              <p className="mb-0 mt-2 text-[0.95rem] font-bold text-[var(--color-primary-light)]">
                Precio: S/ {Number(horarioSeleccionado.precio).toFixed(2)}
              </p>
            </div>
          </section>
        ) : (
          <p className="mc-reserva-ayuda mc-reserva-bloque">
            {!usuario ? (
              <>Modo invitado: se creará una sesión temporal si es necesario.</>
            ) : (
              <>Elige fecha, sala y horario para ver el resumen.</>
            )}
          </p>
        )}

        <Input
          etiqueta="Cantidad de personas (máx. 4)"
          name="cantidad_personas"
          type="number"
          min={1}
          max={4}
          value={cantidadPersonas}
          onChange={onCambioCantidadPersonas}
          required
        />

        <p className="mc-reserva-ayuda mb-[var(--space-md)]">
          Los horarios dependen de la duración de la película, la limpieza de la sala y las reservas
          existentes.
        </p>

        <Button
          type="submit"
          variante="primario"
          anchoCompleto
          cargando={enviando}
          disabled={!puedeEnviar}
          className="!hidden md:!inline-flex"
        >
          Confirmar reserva
        </Button>
      </form>
    </>
  )
}

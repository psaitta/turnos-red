import { EventEmitter } from 'node:events';
import type { Turno } from '../models/turno.model.js';

type EventosTurnos = {
  'turno:creado': [turno: Turno];
  'turno:actualizado': [turno: Turno];
  'turno:eliminado': [turno: Turno];
};

/**
 * Bus de eventos internos y desacoplado del servidor HTTP.
 * Los servicios emiten eventos al modificar datos; los sockets (y cualquier
 * otro módulo interesado) se suscriben sin conocerse entre sí.
 */
class TurnosEmitter extends EventEmitter {
  override on<E extends keyof EventosTurnos>(
    evento: E,
    listener: (...args: EventosTurnos[E]) => void,
  ): this {
    return super.on(evento, listener as (...args: unknown[]) => void);
  }

  override emit<E extends keyof EventosTurnos>(evento: E, ...args: EventosTurnos[E]): boolean {
    return super.emit(evento, ...args);
  }
}

export const turnosEmitter = new TurnosEmitter();

import fs from 'node:fs/promises';
import { env } from '../config/env.js';
import { normalizarTurnos } from './normalizarTurnos.js';
import { turnosEmitter } from '../events/turnosEmitter.js';
import type { Turno, TurnoCrudo, TurnoNuevo } from '../models/turno.model.js';

let turnos: Turno[] = [];

/**
 * Lee y normaliza el archivo de turnos al iniciar el servidor.
 * Usa fs/promises con async/await y try...catch, según pide la consigna.
 */
export async function inicializarTurnos(): Promise<void> {
  try {
    const contenido = await fs.readFile(env.dataFilePath, 'utf-8');
    const crudos: TurnoCrudo[] = JSON.parse(contenido);
    turnos = normalizarTurnos(crudos);
  } catch (error) {
    console.error('No se pudo leer el archivo de turnos:', (error as Error).message);
    turnos = [];
  }
}

async function persistirTurnos(): Promise<void> {
  await fs.writeFile(env.dataFilePath, JSON.stringify(turnos, null, 2), 'utf-8');
}

export function obtenerTurnos(): Turno[] {
  return turnos;
}

export function obtenerTurnoPorId(id: number): Turno | undefined {
  return turnos.find((turno) => turno.id === id);
}

function generarNuevoId(): number {
  const idMaximo = turnos.reduce((maximo, turno) => Math.max(maximo, turno.id), 0);
  return idMaximo + 1;
}

export async function crearTurno(datos: TurnoNuevo): Promise<Turno> {
  const nuevoTurno: Turno = { id: generarNuevoId(), ...datos };
  turnos.push(nuevoTurno);
  await persistirTurnos();
  turnosEmitter.emit('turno:creado', nuevoTurno);
  return nuevoTurno;
}

export async function actualizarTurno(
  id: number,
  datos: Partial<TurnoNuevo>,
): Promise<Turno | null> {
  const indice = turnos.findIndex((turno) => turno.id === id);
  if (indice === -1) {
    return null;
  }

  const turnoActualizado: Turno = { ...turnos[indice], ...datos, id };
  turnos[indice] = turnoActualizado;
  await persistirTurnos();
  turnosEmitter.emit('turno:actualizado', turnoActualizado);
  return turnoActualizado;
}

export async function eliminarTurno(id: number): Promise<boolean> {
  const indice = turnos.findIndex((turno) => turno.id === id);
  if (indice === -1) {
    return false;
  }

  const [turnoEliminado] = turnos.splice(indice, 1);
  await persistirTurnos();
  turnosEmitter.emit('turno:eliminado', turnoEliminado);
  return true;
}

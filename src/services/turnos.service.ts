import fs from 'node:fs/promises';
import { env } from '../config/env.js';
import { normalizarTurnos } from './normalizarTurnos.js';
import { turnosEmitter } from '../events/turnosEmitter.js';
import { obtenerMedicoPorId } from './medicos.service.js';
import { AppError } from '../utils/AppError.js';
import type { Turno, TurnoCrudo, TurnoNuevo } from '../models/turno.model.js';

let turnos: Turno[] = [];

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

interface FiltrosTurnos {
  especialidad?: string;
  fecha?: string;
  medicoId?: number;
}

export function obtenerTurnos(filtros: FiltrosTurnos = {}): Turno[] {
  return turnos.filter((turno) => {
    const coincideEspecialidad = filtros.especialidad
      ? turno.especialidad.toLowerCase() === filtros.especialidad.toLowerCase()
      : true;
    const coincideFecha = filtros.fecha ? turno.fecha === filtros.fecha : true;
    const coincideMedico =
      filtros.medicoId !== undefined ? turno.medicoId === filtros.medicoId : true;
    return coincideEspecialidad && coincideFecha && coincideMedico;
  });
}

export function obtenerTurnoPorId(id: number): Turno | undefined {
  return turnos.find((turno) => turno.id === id);
}

function generarNuevoId(): number {
  const idMaximo = turnos.reduce((maximo, turno) => Math.max(maximo, turno.id), 0);
  return idMaximo + 1;
}

function verificarMedicoExiste(medicoId: number): void {
  const medico = obtenerMedicoPorId(medicoId);
  if (!medico) {
    throw new AppError(404, `No existe un médico con id ${medicoId}`, 'MEDICO_NOT_FOUND');
  }
}

export async function crearTurno(datos: TurnoNuevo): Promise<Turno> {
  verificarMedicoExiste(datos.medicoId);

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

  if (datos.medicoId !== undefined) {
    verificarMedicoExiste(datos.medicoId);
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

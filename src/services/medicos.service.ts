import fs from 'node:fs/promises';
import { env } from '../config/env.js';
import type { Medico, MedicoNuevo } from '../models/medico.model.js';

let medicos: Medico[] = [];

export async function inicializarMedicos(): Promise<void> {
  try {
    const contenido = await fs.readFile(env.medicosFilePath, 'utf-8');
    medicos = JSON.parse(contenido) as Medico[];
    console.log(`Médicos cargados: ${medicos.length}`);
  } catch (error) {
    console.error('No se pudo leer el archivo de médicos:', (error as Error).message);
    medicos = [];
  }
}

async function persistirMedicos(): Promise<void> {
  await fs.writeFile(env.medicosFilePath, JSON.stringify(medicos, null, 2), 'utf-8');
}

interface FiltrosMedicos {
  especialidad?: string;
  disponible?: boolean;
}

export function obtenerMedicos(filtros: FiltrosMedicos = {}): Medico[] {
  return medicos.filter((medico) => {
    const coincideEspecialidad = filtros.especialidad
      ? medico.especialidad.toLowerCase() === filtros.especialidad.toLowerCase()
      : true;
    const coincideDisponible =
      filtros.disponible !== undefined ? medico.disponible === filtros.disponible : true;
    return coincideEspecialidad && coincideDisponible;
  });
}

export function obtenerMedicoPorId(id: number): Medico | undefined {
  return medicos.find((medico) => medico.id === id);
}

function generarNuevoId(): number {
  const idMaximo = medicos.reduce((maximo, medico) => Math.max(maximo, medico.id), 0);
  return idMaximo + 1;
}

export async function crearMedico(datos: MedicoNuevo): Promise<Medico> {
  const nuevoMedico: Medico = { id: generarNuevoId(), ...datos };
  medicos.push(nuevoMedico);
  await persistirMedicos();
  return nuevoMedico;
}

export async function actualizarMedico(
  id: number,
  datos: Partial<MedicoNuevo>,
): Promise<Medico | null> {
  const indice = medicos.findIndex((medico) => medico.id === id);
  if (indice === -1) {
    return null;
  }

  const medicoActualizado: Medico = { ...medicos[indice], ...datos, id };
  medicos[indice] = medicoActualizado;
  await persistirMedicos();
  return medicoActualizado;
}

export async function eliminarMedico(id: number): Promise<boolean> {
  const indice = medicos.findIndex((medico) => medico.id === id);
  if (indice === -1) {
    return false;
  }

  medicos.splice(indice, 1);
  await persistirMedicos();
  return true;
}

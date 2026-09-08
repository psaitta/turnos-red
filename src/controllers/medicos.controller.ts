import type { Request, Response } from 'express';
import * as medicosService from '../services/medicos.service.js';
import { AppError } from '../utils/AppError.js';
import type { MedicoNuevo } from '../models/medico.model.js';

function parseIdOrThrow(idParam: string | string[]): number {
  const valor = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'El id debe ser un número entero positivo', 'INVALID_ID');
  }
  return id;
}

export function listarMedicos(req: Request, res: Response): void {
  const { especialidad, disponible } = req.query;

  const filtros = {
    especialidad: typeof especialidad === 'string' ? especialidad : undefined,
    disponible: typeof disponible === 'string' ? disponible === 'true' : undefined,
  };

  res.status(200).json(medicosService.obtenerMedicos(filtros));
}

export function obtenerMedico(req: Request, res: Response): void {
  const id = parseIdOrThrow(req.params.id);
  const medico = medicosService.obtenerMedicoPorId(id);

  if (!medico) {
    throw new AppError(404, `No se encontró el médico con id ${id}`, 'MEDICO_NOT_FOUND');
  }

  res.status(200).json(medico);
}

export async function crearMedico(req: Request, res: Response): Promise<void> {
  const nuevoMedico = await medicosService.crearMedico(req.body as MedicoNuevo);
  res.status(201).json(nuevoMedico);
}

export async function actualizarMedico(req: Request, res: Response): Promise<void> {
  const id = parseIdOrThrow(req.params.id);
  const medicoActualizado = await medicosService.actualizarMedico(id, req.body);

  if (!medicoActualizado) {
    throw new AppError(404, `No se encontró el médico con id ${id}`, 'MEDICO_NOT_FOUND');
  }

  res.status(200).json(medicoActualizado);
}

export async function eliminarMedico(req: Request, res: Response): Promise<void> {
  const id = parseIdOrThrow(req.params.id);
  const eliminado = await medicosService.eliminarMedico(id);

  if (!eliminado) {
    throw new AppError(404, `No se encontró el médico con id ${id}`, 'MEDICO_NOT_FOUND');
  }

  res.status(204).send();
}

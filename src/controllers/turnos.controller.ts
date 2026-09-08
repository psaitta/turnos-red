import type { Request, Response } from 'express';
import * as turnosService from '../services/turnos.service.js';
import { AppError } from '../utils/AppError.js';
import type { TurnoNuevo } from '../models/turno.model.js';

function parseIdOrThrow(idParam: string | string[]): number {
  const valor = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'El id debe ser un número entero positivo', 'INVALID_ID');
  }
  return id;
}

function parseFiltros(query: Request['query']) {
  const { especialidad, fecha, medicoId } = query;
  return {
    especialidad: typeof especialidad === 'string' ? especialidad : undefined,
    fecha: typeof fecha === 'string' ? fecha : undefined,
    medicoId: typeof medicoId === 'string' ? Number(medicoId) : undefined,
  };
}

export function listarTurnos(req: Request, res: Response): void {
  const filtros = parseFiltros(req.query);
  res.status(200).json(turnosService.obtenerTurnos(filtros));
}

export function obtenerTurno(req: Request, res: Response): void {
  const id = parseIdOrThrow(req.params.id);
  const turno = turnosService.obtenerTurnoPorId(id);

  if (!turno) {
    throw new AppError(404, `No se encontró el turno con id ${id}`, 'TURNO_NOT_FOUND');
  }

  res.status(200).json(turno);
}

export async function crearTurno(req: Request, res: Response): Promise<void> {
  const nuevoTurno = await turnosService.crearTurno(req.body as TurnoNuevo);
  res.status(201).json(nuevoTurno);
}

export async function actualizarTurno(req: Request, res: Response): Promise<void> {
  const id = parseIdOrThrow(req.params.id);
  const turnoActualizado = await turnosService.actualizarTurno(id, req.body);

  if (!turnoActualizado) {
    throw new AppError(404, `No se encontró el turno con id ${id}`, 'TURNO_NOT_FOUND');
  }

  res.status(200).json(turnoActualizado);
}

export async function eliminarTurno(req: Request, res: Response): Promise<void> {
  const id = parseIdOrThrow(req.params.id);
  const eliminado = await turnosService.eliminarTurno(id);

  if (!eliminado) {
    throw new AppError(404, `No se encontró el turno con id ${id}`, 'TURNO_NOT_FOUND');
  }

  res.status(204).send();
}

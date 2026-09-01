import type { Request, Response } from 'express';
import * as turnosService from '../services/turnos.service.js';
import type { TurnoNuevo } from '../models/turno.model.js';

function esTurnoNuevoValido(body: unknown): body is TurnoNuevo {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const datos = body as Record<string, unknown>;

  return (
    typeof datos.paciente === 'string' &&
    datos.paciente.trim() !== '' &&
    typeof datos.documento === 'string' &&
    datos.documento.trim() !== '' &&
    typeof datos.especialidad === 'string' &&
    datos.especialidad.trim() !== '' &&
    typeof datos.fecha === 'string' &&
    datos.fecha.trim() !== '' &&
    typeof datos.hora === 'string' &&
    datos.hora.trim() !== '' &&
    typeof datos.confirmado === 'boolean'
  );
}

export function listarTurnos(_req: Request, res: Response): void {
  const turnos = turnosService.obtenerTurnos();
  res.status(200).json(turnos);
}

export function obtenerTurno(req: Request, res: Response): void {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ mensaje: 'El id debe ser un número entero positivo' });
    return;
  }

  const turno = turnosService.obtenerTurnoPorId(id);

  if (!turno) {
    res.status(404).json({ mensaje: `No se encontró el turno con id ${id}` });
    return;
  }

  res.status(200).json(turno);
}

export async function crearTurno(req: Request, res: Response): Promise<void> {
  if (!esTurnoNuevoValido(req.body)) {
    res.status(400).json({ mensaje: 'Datos de turno inválidos o incompletos' });
    return;
  }

  const nuevoTurno = await turnosService.crearTurno(req.body);
  res.status(201).json(nuevoTurno);
}

export async function actualizarTurno(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ mensaje: 'El id debe ser un número entero positivo' });
    return;
  }

  const turnoActualizado = await turnosService.actualizarTurno(id, req.body as Partial<TurnoNuevo>);

  if (!turnoActualizado) {
    res.status(404).json({ mensaje: `No se encontró el turno con id ${id}` });
    return;
  }

  res.status(200).json(turnoActualizado);
}

export async function eliminarTurno(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ mensaje: 'El id debe ser un número entero positivo' });
    return;
  }

  const eliminado = await turnosService.eliminarTurno(id);

  if (!eliminado) {
    res.status(404).json({ mensaje: `No se encontró el turno con id ${id}` });
    return;
  }

  res.status(200).json({ mensaje: `Turno ${id} eliminado correctamente` });
}

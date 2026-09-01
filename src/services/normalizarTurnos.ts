import type { Turno, TurnoCrudo } from '../models/turno.model.js';

function normalizarFecha(fecha: string): string | null {
  const trimmed = fecha.trim();
  const formatoIso = /^\d{4}-\d{2}-\d{2}$/;
  const formatoDdMmYyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;

  if (formatoIso.test(trimmed)) {
    return trimmed;
  }

  const coincidencia = trimmed.match(formatoDdMmYyyy);
  if (coincidencia) {
    const [, dia, mes, anio] = coincidencia;
    return `${anio}-${mes}-${dia}`;
  }

  return null;
}

function normalizarHora(hora: string): string | null {
  const trimmed = hora.trim().replace('.', ':');
  const formatoHora = /^([01]?\d|2[0-3]):([0-5]\d)$/;
  const coincidencia = trimmed.match(formatoHora);

  if (!coincidencia) {
    return null;
  }

  const horas = coincidencia[1].padStart(2, '0');
  const minutos = coincidencia[2];
  return `${horas}:${minutos}`;
}

function normalizarConfirmado(valor: string | boolean | number): boolean {
  if (typeof valor === 'boolean') {
    return valor;
  }

  if (typeof valor === 'number') {
    return valor === 1;
  }

  const normalizado = valor.trim().toLowerCase();
  return ['si', 'sí', 'true', '1', 'confirmado'].includes(normalizado);
}

function idComoEnteroPositivo(id: string): number | null {
  const idNumerico = Number(id);
  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    return null;
  }
  return idNumerico;
}

/**
 * Convierte un registro crudo en un Turno de dominio.
 * Devuelve null si el registro no cumple con la estructura mínima esperada.
 */
export function normalizarTurno(crudo: TurnoCrudo): Turno | null {
  const idValido = idComoEnteroPositivo(crudo.id);
  const paciente = crudo.paciente?.trim().replace(/\s+/g, ' ') ?? '';
  const documento = String(crudo.documento ?? '').trim();
  const especialidad = crudo.especialidad?.trim().toLowerCase() ?? '';
  const fecha = normalizarFecha(crudo.fecha ?? '');
  const hora = normalizarHora(crudo.hora ?? '');

  const esValido =
    idValido !== null &&
    paciente !== '' &&
    documento !== '' &&
    especialidad !== '' &&
    fecha !== null &&
    hora !== null;

  if (!esValido) {
    return null;
  }

  const turno: Turno = {
    id: idValido as number,
    paciente,
    documento,
    especialidad,
    fecha: fecha as string,
    hora: hora as string,
    confirmado: normalizarConfirmado(crudo.confirmado),
  };

  if (crudo.observaciones?.trim()) {
    turno.observaciones = crudo.observaciones.trim();
  }

  return turno;
}

/**
 * Normaliza una lista completa de registros crudos, descarta los inválidos
 * e informa por consola cuántos fueron aceptados y cuántos rechazados.
 */
export function normalizarTurnos(crudos: TurnoCrudo[]): Turno[] {
  let aceptados = 0;
  let rechazados = 0;
  const turnosValidos: Turno[] = [];

  for (const crudo of crudos) {
    const turno = normalizarTurno(crudo);
    if (turno) {
      turnosValidos.push(turno);
      aceptados += 1;
    } else {
      rechazados += 1;
    }
  }

  console.log(`Normalización de turnos -> aceptados: ${aceptados}, rechazados: ${rechazados}`);

  return turnosValidos;
}

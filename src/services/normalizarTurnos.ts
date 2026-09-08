import type { Turno, TurnoCrudo } from '../models/turno.model.js';
import { ESPECIALIDADES } from '../schemas/turno.schema.js';

const MAPA_ESPECIALIDADES: Record<string, (typeof ESPECIALIDADES)[number]> = {
  'clínica médica': 'Clínica médica',
  'clinica medica': 'Clínica médica',
  pediatría: 'Pediatría',
  pediatria: 'Pediatría',
  odontología: 'Odontología',
  odontologia: 'Odontología',
  nutrición: 'Nutrición',
  nutricion: 'Nutrición',
};

function normalizarEspecialidad(valor: string): (typeof ESPECIALIDADES)[number] | null {
  const clave = valor.trim().toLowerCase();
  return MAPA_ESPECIALIDADES[clave] ?? null;
}

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

function idComoEnteroPositivo(id: string | number): number | null {
  const idNumerico = Number(id);
  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    return null;
  }
  return idNumerico;
}

export function normalizarTurno(crudo: TurnoCrudo): Turno | null {
  const idValido = idComoEnteroPositivo(crudo.id);
  const paciente = crudo.paciente?.trim().replace(/\s+/g, ' ') ?? '';
  const documento = String(crudo.documento ?? '').trim();
  const especialidad = normalizarEspecialidad(crudo.especialidad ?? '');
  const fecha = normalizarFecha(crudo.fecha ?? '');
  const hora = normalizarHora(crudo.hora ?? '');
  const medicoId = idComoEnteroPositivo(crudo.medicoId);

  const esValido =
    idValido !== null &&
    paciente !== '' &&
    documento !== '' &&
    especialidad !== null &&
    fecha !== null &&
    hora !== null &&
    medicoId !== null;

  if (!esValido) {
    return null;
  }

  const turno: Turno = {
    id: idValido as number,
    paciente,
    documento,
    especialidad: especialidad as (typeof ESPECIALIDADES)[number],
    fecha: fecha as string,
    hora: hora as string,
    confirmado: normalizarConfirmado(crudo.confirmado),
    medicoId: medicoId as number,
  };

  if (crudo.observaciones?.trim()) {
    turno.observaciones = crudo.observaciones.trim();
  }

  return turno;
}

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

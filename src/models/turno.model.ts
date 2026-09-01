/**
 * Representa un registro tal como llega desde el archivo JSON de una sede,
 * con formatos inconsistentes entre sí (fechas, horas, booleanos como texto, etc.).
 */
export interface TurnoCrudo {
  id: string;
  paciente: string;
  documento: number | string;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: string | boolean | number;
  observaciones?: string;
}

/**
 * Representa un turno ya normalizado, con los tipos de dominio
 * que utiliza el resto de la aplicación.
 */
export interface Turno {
  id: number;
  paciente: string;
  documento: string;
  especialidad: string;
  fecha: string; // formato ISO: yyyy-mm-dd
  hora: string; // formato 24 h: HH:mm
  confirmado: boolean;
  observaciones?: string;
}

/** Datos necesarios para crear un turno nuevo (sin id, lo genera el servicio). */
export type TurnoNuevo = Omit<Turno, 'id'>;

export interface TurnoCrudo {
  id: string;
  paciente: string;
  documento: number | string;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: string | boolean | number;
  medicoId: number | string;
  observaciones?: string;
}

export interface Turno {
  id: number;
  paciente: string;
  documento: string;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: boolean;
  medicoId: number;
  observaciones?: string;
}

export type TurnoNuevo = Omit<Turno, 'id'>;

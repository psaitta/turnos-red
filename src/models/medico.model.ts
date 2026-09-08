export interface Medico {
  id: number;
  nombre: string;
  especialidad: string;
  matricula: string;
  disponible: boolean;
}

export type MedicoNuevo = Omit<Medico, 'id'>;

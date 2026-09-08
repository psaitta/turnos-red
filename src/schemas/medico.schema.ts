import { z } from 'zod';
import { ESPECIALIDADES } from './turno.schema.js';

export const medicoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  especialidad: z.enum(ESPECIALIDADES, {
    error: `La especialidad debe ser una de: ${ESPECIALIDADES.join(', ')}`,
  }),
  matricula: z.string().trim().min(1, 'La matrícula es obligatoria'),
  disponible: z.boolean(),
});

export const medicoUpdateSchema = medicoSchema.partial();

export type MedicoInput = z.infer<typeof medicoSchema>;
export type MedicoUpdateInput = z.infer<typeof medicoUpdateSchema>;

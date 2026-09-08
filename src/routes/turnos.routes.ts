import { Router } from 'express';
import * as turnosController from '../controllers/turnos.controller.js';
import { validate } from '../middlewares/validate.js';
import { turnoSchema, turnoUpdateSchema } from '../schemas/turno.schema.js';

export const turnosRouter = Router();

turnosRouter.get('/', turnosController.listarTurnos);
turnosRouter.get('/:id', turnosController.obtenerTurno);
turnosRouter.post('/', validate(turnoSchema), turnosController.crearTurno);
turnosRouter.put('/:id', validate(turnoUpdateSchema), turnosController.actualizarTurno);
turnosRouter.delete('/:id', turnosController.eliminarTurno);

import { Router } from 'express';
import * as turnosController from '../controllers/turnos.controller.js';

export const turnosRouter = Router();

turnosRouter.get('/', turnosController.listarTurnos);
turnosRouter.get('/:id', turnosController.obtenerTurno);
turnosRouter.post('/', turnosController.crearTurno);
turnosRouter.put('/:id', turnosController.actualizarTurno);
turnosRouter.delete('/:id', turnosController.eliminarTurno);

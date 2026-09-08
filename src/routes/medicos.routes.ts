import { Router } from 'express';
import * as medicosController from '../controllers/medicos.controller.js';
import { validate } from '../middlewares/validate.js';
import { medicoSchema, medicoUpdateSchema } from '../schemas/medico.schema.js';

export const medicosRouter = Router();

medicosRouter.get('/', medicosController.listarMedicos);
medicosRouter.get('/:id', medicosController.obtenerMedico);
medicosRouter.post('/', validate(medicoSchema), medicosController.crearMedico);
medicosRouter.put('/:id', validate(medicoUpdateSchema), medicosController.actualizarMedico);
medicosRouter.delete('/:id', medicosController.eliminarMedico);

import express from 'express';
import { turnosRouter } from './routes/turnos.routes.js';
import { medicosRouter } from './routes/medicos.routes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

export const app = express();

app.use(express.json());
app.use('/turnos', turnosRouter);
app.use('/medicos', medicosRouter);

app.use(notFoundHandler);
app.use(errorHandler);

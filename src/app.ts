import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { turnosRouter } from './routes/turnos.routes.js';

export const app = express();

app.use(express.json());
app.use('/turnos', turnosRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ mensaje: 'Recurso no encontrado' });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error no controlado:', error);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

/** Se ejecuta cuando ninguna ruta coincide con la solicitud. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    status: 404,
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    code: 'ROUTE_NOT_FOUND',
    details: [],
  });
}

/**
 * Middleware final de manejo de errores. Unifica toda respuesta fallida
 * de la API bajo el mismo formato JSON: { status, message, code, details }.
 * Express 5 reenvía automáticamente acá cualquier error lanzado (throw)
 * o cualquier rechazo de una Promise dentro de un handler async.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.status).json({
      status: error.status,
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return;
  }

  console.error('Error no controlado:', error);
  res.status(500).json({
    status: 500,
    message: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
    details: [],
  });
}

import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware genérico de validación: recibe un schema de Zod y valida
 * req.body contra él. Si falla, arma el detalle de errores campo por campo
 * y lo delega al middleware centralizado de errores mediante next(error).
 */
export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const detalles = resultado.error.issues.map((issue) => ({
        campo: issue.path.join('.') || '(raíz)',
        mensaje: issue.message,
      }));

      next(
        new AppError(
          400,
          'Error de validación en los datos ingresados',
          'VALIDATION_ERROR',
          detalles,
        ),
      );
      return;
    }

    req.body = resultado.data;
    next();
  };
}

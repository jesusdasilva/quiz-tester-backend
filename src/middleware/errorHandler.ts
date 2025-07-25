import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { ResponseUtil } from '../utils/response';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  Logger.error('Error no manejado', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  ResponseUtil.error(res, 'Error interno del servidor', 500, error);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  ResponseUtil.notFound(res, `Ruta ${req.originalUrl} no encontrada`);
}; 
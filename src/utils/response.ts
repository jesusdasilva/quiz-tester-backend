import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Función para formatear fechas en las respuestas
const formatDates = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(formatDates);
  }
  
  if (typeof obj === 'object') {
    const formatted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'createdAt' || key === 'updatedAt') {
        formatted[key] = value instanceof Date ? value.toISOString() : value;
      } else {
        formatted[key] = formatDates(value);
      }
    }
    return formatted;
  }
  
  return obj;
};

export class ResponseUtil {
  static success<T>(res: Response, data: T, message: string = 'Operación exitosa', statusCode: number = 200): void {
    const formattedData = formatDates(data);
    const response: ApiResponse<T> = {
      success: true,
      message,
      data: formattedData
    };
    res.status(statusCode).json(response);
  }

  static error(res: Response, message: string = 'Error en la operación', statusCode: number = 500, error?: any): void {
    const response: ApiResponse = {
      success: false,
      message,
      error: error?.message || error
    };
    res.status(statusCode).json(response);
  }

  static notFound(res: Response, message: string = 'Recurso no encontrado'): void {
    this.error(res, message, 404);
  }

  static badRequest(res: Response, message: string = 'Solicitud incorrecta', additionalData?: any): void {
    const response: ApiResponse = {
      success: false,
      message,
      error: additionalData
    };
    res.status(400).json(response);
  }

  static unauthorized(res: Response, message: string = 'No autorizado'): void {
    this.error(res, message, 401);
  }
} 
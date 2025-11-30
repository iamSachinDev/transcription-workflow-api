import { NextFunction, Request, Response } from 'express'
import { logger } from '../lib/logger'

export class AppError extends Error {
  statusCode: number
  details?: unknown
  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' })
}

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500
  const correlationId = req.id
  logger.error({ err, statusCode, correlationId }, 'Request error')
  res.status(statusCode).json({ message: err.message, correlationId })
}

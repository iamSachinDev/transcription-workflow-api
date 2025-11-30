import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'
import { AppError } from './errorHandler'

export const validateBody =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message
      }))
      return next(new AppError('Validation error', 400, details))
    }
    req.body = result.data as T
    return next()
  }

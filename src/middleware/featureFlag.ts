import { NextFunction, Request, Response } from 'express'
import { isFeatureEnabled } from '../config/features'
import { AppError } from './errorHandler'

/**
 * Middleware to check if a feature is enabled
 * @param module - Module name (e.g., 'transcriptions', 'users')
 * @param feature - Feature name (e.g., 'list', 'create')
 */
export const requireFeature = (module: string, feature: string) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    if (!isFeatureEnabled(module, feature)) {
      return next(new AppError(`Feature '${module}.${feature}' is disabled`, 403))
    }
    next()
  }
}

/**
 * Auto-detect feature name from HTTP method, with optional override
 * @param module - Module name (e.g., 'transcriptions', 'users')
 * @param featureOverride - Optional feature name to override auto-detection
 */
export const autoRequireFeature = (module: string, featureOverride?: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    let feature: string | undefined = featureOverride

    // If no override, auto-detect from HTTP method
    if (!feature) {
      const methodToFeature: Record<string, string> = {
        GET: 'list',
        POST: 'create',
        PUT: 'update',
        PATCH: 'update',
        DELETE: 'delete'
      }
      feature = methodToFeature[req.method]
    }

    if (!feature) {
      // If method not mapped, allow through (or you could deny)
      return next()
    }

    if (!isFeatureEnabled(module, feature)) {
      return next(new AppError(`Feature '${module}.${feature}' is disabled`, 403))
    }

    next()
  }
}

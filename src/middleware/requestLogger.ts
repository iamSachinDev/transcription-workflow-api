// src/middleware/requestLogger.ts
import { randomUUID } from 'crypto'
import type { Request, RequestHandler } from 'express'
import type { IncomingMessage, ServerResponse } from 'http'
import pinoHttp from 'pino-http'
import { config } from '../config/env'
import { logger } from '../lib/logger'

const CORRELATION_HEADER = 'x-correlation-id'
const HEALTH_PATHS = ['/health', '/favicon.ico']

// Helper type: pino-http attaches `id` to the Request object at runtime.
type ReqWithId = Request & { id?: string; user?: { id?: string } }

// Headers we consider sensitive and should be redacted in logs
const SENSITIVE_HEADERS = new Set([
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-amz-security-token',
  'x-csrf-token'
])

/**
 * Return a shallow copy of headers with sensitive values replaced by '[REDACTED]'.
 */
function maskHeaders(headers: IncomingMessage['headers'] | undefined) {
  if (!headers) return {}
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(headers)) {
    const key = k.toLowerCase()
    if (SENSITIVE_HEADERS.has(key)) {
      // keep shape but redact value(s)
      if (Array.isArray(v)) out[key] = v.map(() => '[REDACTED]')
      else if (typeof v === 'string') out[key] = '[REDACTED]'
      else out[key] = '[REDACTED]'
    } else {
      out[key] = v
    }
  }
  return out
}

/**
 * Serializer for the request object used by pino.
 * Keeps useful fields but masks sensitive headers.
 */
function reqSerializer(req: IncomingMessage) {
  try {
    const maybeUrl = (req as any).url as string | undefined
    const r = req as ReqWithId

    return {
      id: r.id ?? undefined,
      method: (req as any).method ?? undefined,
      url: maybeUrl ?? undefined,
      // correlationId may be set on req.id by pino-http genReqId
      correlationId: r.id ?? (req.headers?.[CORRELATION_HEADER] as string | undefined) ?? undefined,
      // remote address details if available
      remoteAddress: (req.socket && (req.socket.remoteAddress ?? undefined)) ?? undefined,
      remotePort: (req.socket && (req.socket.remotePort ?? undefined)) ?? undefined,
      // headers with sensitive values masked
      headers: maskHeaders(req.headers)
    }
  } catch {
    // fall back gracefully if something unexpected happens
    return { method: (req as any).method ?? undefined, url: (req as any).url ?? undefined }
  }
}

const raw = pinoHttp({
  logger,

  // Generate or reuse correlation id
  genReqId: (req: IncomingMessage) => {
    const hdr = (req.headers?.[CORRELATION_HEADER] ?? '') as string
    if (hdr && hdr.trim().length > 0) return hdr
    const maybeId = (req as any).id as string | undefined
    return maybeId && maybeId.length > 0 ? maybeId : randomUUID()
  },

  // Skip logging for health checks or very noisy endpoints
  autoLogging: {
    ignore: (req: IncomingMessage) => {
      try {
        const url = (req as any).url as string | undefined
        if (!url) return false
        return HEALTH_PATHS.some((p) => url.startsWith(p))
      } catch {
        return false
      }
    }
  },

  // Map response status and errors to log levels
  customLogLevel: (req: IncomingMessage, res: ServerResponse, err: unknown) => {
    const status = typeof res.statusCode === 'number' ? res.statusCode : 0
    if (err || status >= 500) return 'error'
    if (status >= 400) return 'warn'
    return 'info'
  },

  // Add additional structured props to every request log
  customProps: (req: IncomingMessage) => {
    const r = req as ReqWithId
    return {
      correlationId: r.id ?? (req.headers?.[CORRELATION_HEADER] as string | undefined) ?? null,
      serviceId: config.serviceId,
      userId: r.user?.id ?? null
    }
  },

  // Provide serializers to control how req is logged (mask sensitive headers)
  serializers: {
    req: reqSerializer
    // you can also provide `res` or `err` serializers here if needed
  }
})

// Export typed RequestHandler for express
export const requestLogger: RequestHandler = raw as unknown as RequestHandler

export default requestLogger

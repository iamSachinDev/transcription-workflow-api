import compression from 'compression'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { config } from './config/env'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import requestLogger from './middleware/requestLogger'
import { registerModules } from './modules'
import swaggerOutput from './swagger_output.json'

const app = express()

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    }
  })
)

// CORS configuration
const corsOrigins =
  config.corsOrigins === '*' ? '*' : config.corsOrigins.split(',').map((origin) => origin.trim())

const corsOptions = {
  origin: corsOrigins,
  credentials: true
}
app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
})
app.use('/api/', limiter)

// Compression (gzip)
app.use(
  compression({
    level: config.compressionLevel,
    threshold: config.compressionThreshold,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    }
  })
)

// Body parser
app.use(express.json())
app.use(requestLogger)

// Routes
app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput))

registerModules(app)

// Error handlers
app.use(notFoundHandler)
app.use(errorHandler)

export default app

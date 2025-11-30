import pino from 'pino'
import { config } from '../config/env'

const isDev = config.nodeEnv !== 'production'

export const logger = pino({
  base: { serviceId: config.serviceId },
  level: isDev ? 'debug' : 'info',
  transport:
    isDev && config.nodeEnv !== 'test'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
      : undefined
})

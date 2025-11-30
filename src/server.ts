import http from 'http'
import app from './app'
import { config } from './config/env'
import { connectToMongo, disconnectMongo } from './db/mongoClient'
import { logger } from './lib/logger'

const start = async () => {
  try {
    await connectToMongo()
    logger.info({ env: config.nodeEnv }, 'Environment loaded')

    // Initialize indexes
    const { transcriptionRepository } = await import('./modules/transcriptions/transcription.repository')
    const { workflowRepository } = await import('./modules/workflow/workflow.repository')
    await transcriptionRepository.createIndexes()
    await workflowRepository.createIndexes()
    logger.info('Indexes created')

    const server = http.createServer(app)
    server.listen(config.port, () => logger.info({ port: config.port }, 'Server listening'))
    const shutdown = async () => {
      logger.info('Shutting down...')
      server.close(async () => {
        await disconnectMongo()
        process.exit(0)
      })
    }
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (err) {
    logger.error({ err }, 'Failed to start')
    process.exit(1)
  }
}

start()

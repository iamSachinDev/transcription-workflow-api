import { Express } from 'express'
import { isModuleEnabled } from '../config/features'
import { logger } from '../lib/logger'
import { azureModule } from './azure'
import { transcriptionsModule } from './transcriptions'
import { ApiModule } from './types'
import { usersModule } from './users'
import { workflowModule } from './workflow'

export const modules: ApiModule[] = [usersModule, transcriptionsModule, azureModule, workflowModule]

export const registerModules = (app: Express): void => {
  modules.forEach((mod) => {
    if (!isModuleEnabled(mod.name)) {
      logger.info({ module: mod.name }, 'Module disabled via feature flags')
      return
    }
    app.use(mod.basePath, mod.router)
    logger.info({ module: mod.name, basePath: mod.basePath }, 'Module registered')
  })
}

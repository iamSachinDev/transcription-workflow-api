import { ApiModule } from '../types'
import router from './azure.routes'

export const azureModule: ApiModule = { name: 'azure', basePath: '/api/azure', router }

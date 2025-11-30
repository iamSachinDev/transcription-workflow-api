import { ApiModule } from '../types'
import workflowRoutes from './workflow.routes'

export const workflowModule: ApiModule = {
    name: 'workflow',
    basePath: '/api/workflows',
    router: workflowRoutes
}

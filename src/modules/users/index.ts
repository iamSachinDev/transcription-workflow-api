import { ApiModule } from '../types'
import router from './user.routes'
export const usersModule: ApiModule = { name: 'users', basePath: '/api/users', router }

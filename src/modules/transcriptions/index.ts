import { ApiModule } from '../types'
import router from './transcription.routes'

export const transcriptionsModule: ApiModule = {
  name: 'transcriptions',
  basePath: '/api/transcriptions',
  router
}

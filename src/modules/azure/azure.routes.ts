import { Router } from 'express'
import { z } from 'zod'
import { validateBody } from '../../middleware/validate'
import { postAzureTranscription } from './azure.controller'

const router = Router()
const body = z.object({ audioUrl: z.string().url(), language: z.string().optional() })

// #swagger.path = '/api/transcriptions/azure'
router.post('/', validateBody(body), postAzureTranscription)
export default router

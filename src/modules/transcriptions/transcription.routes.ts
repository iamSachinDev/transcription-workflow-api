import { Router } from 'express'
import { autoRequireFeature } from '../../middleware/featureFlag'
import { validateBody } from '../../middleware/validate'
import {
    getAudio,
    getRecentTranscriptions,
    getTranscriptions,
    patchTranscription,
    postTranscription,
    updateTranscription
} from '../transcriptions/transcription.controller'
import { createTranscriptionBody, patchTranscriptionBody, updateTranscriptionBody } from '../transcriptions/zod'

const router = Router()

// #swagger.path = '/api/transcriptions'
router.post(
    '/',
    autoRequireFeature('transcriptions'),
    validateBody(createTranscriptionBody),
    postTranscription
)
router.get('/', autoRequireFeature('transcriptions'), getTranscriptions)
router.get('/recent', autoRequireFeature('transcriptions', 'recent'), getRecentTranscriptions)
router.get('/audio/:id', autoRequireFeature('transcriptions', 'getOne'), getAudio)
router.patch('/:id', autoRequireFeature('transcriptions', 'patch'), validateBody(patchTranscriptionBody), patchTranscription)
router.put('/:id', autoRequireFeature('transcriptions', 'put'), validateBody(updateTranscriptionBody), updateTranscription)

export default router

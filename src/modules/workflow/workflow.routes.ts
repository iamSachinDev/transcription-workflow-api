import { Router } from 'express'
import { z } from 'zod'
import { validateBody } from '../../middleware/validate'
import * as workflowController from './workflow.controller'

const router = Router()

const createWorkflowBody = z.object({
    transcriptionId: z.string(),
    assignee: z.string().optional()
})

const advanceWorkflowBody = z.object({
    targetState: z.enum(['transcription', 'review', 'approval', 'completed', 'rejected']),
    assignee: z.string().optional(),
    notes: z.string().optional()
})

const rejectWorkflowBody = z.object({
    reason: z.string(),
    assignee: z.string().optional()
})

// #swagger.path = '/api/workflows'
router.post('/', validateBody(createWorkflowBody), workflowController.createWorkflow)

// #swagger.path = '/api/workflows/{id}'
router.get('/:id', workflowController.getWorkflow)

// #swagger.path = '/api/workflows'
router.get('/', workflowController.getWorkflowsByState)

// #swagger.path = '/api/workflows/{id}/advance'
router.patch('/:id/advance', validateBody(advanceWorkflowBody), workflowController.advanceWorkflow)

// #swagger.path = '/api/workflows/{id}/reject'
router.patch('/:id/reject', validateBody(rejectWorkflowBody), workflowController.rejectWorkflow)

export default router

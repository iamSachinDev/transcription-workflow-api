import { Request, Response } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler'
import { workflowRepository } from './workflow.repository'
import * as workflowService from './workflow.service'

export const createWorkflow = asyncHandler(async (req: Request, res: Response) => {
    const { transcriptionId, assignee } = req.body
    const workflow = await workflowService.createWorkflow(transcriptionId, assignee)
    res.status(201).json(workflow)
})

export const advanceWorkflow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { targetState, assignee, notes } = req.body
    const workflow = await workflowService.advanceWorkflow(id, targetState, assignee, notes)
    res.json(workflow)
})

export const rejectWorkflow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { reason, assignee } = req.body
    const workflow = await workflowService.rejectWorkflow(id, reason, assignee)
    res.json(workflow)
})

export const getWorkflow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const workflow = await workflowRepository.findById(id)
    if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' })
    }
    res.json(workflow)
})

export const getWorkflowsByState = asyncHandler(async (req: Request, res: Response) => {
    const { state } = req.query
    const workflows = await workflowService.getWorkflowsByState(state as any)
    res.json(workflows)
})

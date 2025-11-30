import { AppError } from '../../middleware/errorHandler'
import { Workflow, WorkflowState } from './workflow.model'
import { workflowRepository } from './workflow.repository'

const STATE_TRANSITIONS: Record<WorkflowState, WorkflowState[]> = {
    transcription: ['review', 'rejected'],
    review: ['approval', 'transcription', 'rejected'],
    approval: ['completed', 'review', 'rejected'],
    completed: [],
    rejected: ['transcription']
}

export const createWorkflow = async (transcriptionId: string, assignee?: string): Promise<Workflow> => {
    const existing = await workflowRepository.findByTranscriptionId(transcriptionId)
    if (existing) throw new AppError('Workflow already exists for this transcription', 409)

    const workflow = await workflowRepository.create({
        transcriptionId,
        currentState: 'transcription',
        steps: [{
            state: 'transcription',
            enteredAt: new Date(),
            assignee
        }]
    })

    return workflow
}

export const advanceWorkflow = async (
    workflowId: string,
    targetState: WorkflowState,
    assignee?: string,
    notes?: string
): Promise<Workflow> => {
    const workflow = await workflowRepository.findById(workflowId)
    if (!workflow) throw new AppError('Workflow not found', 404)

    const allowedTransitions = STATE_TRANSITIONS[workflow.currentState]
    if (!allowedTransitions.includes(targetState)) {
        throw new AppError(
            `Invalid transition from ${workflow.currentState} to ${targetState}`,
            400
        )
    }

    // Complete current step
    const currentStep = workflow.steps[workflow.steps.length - 1]
    currentStep.completedAt = new Date()
    if (notes) currentStep.notes = notes

    // Add new step
    workflow.steps.push({
        state: targetState,
        enteredAt: new Date(),
        assignee
    })

    workflow.currentState = targetState

    const updated = await workflowRepository.update(workflowId, {
        currentState: workflow.currentState,
        steps: workflow.steps
    })

    if (!updated) throw new AppError('Failed to update workflow', 500)
    return updated
}

export const rejectWorkflow = async (
    workflowId: string,
    reason: string,
    assignee?: string
): Promise<Workflow> => {
    return advanceWorkflow(workflowId, 'rejected', assignee, reason)
}

export const getWorkflowsByState = async (state: WorkflowState): Promise<Workflow[]> => {
    return workflowRepository.findByState(state)
}

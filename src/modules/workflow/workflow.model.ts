import { BaseDocument } from '../../db/mongo.repository'

export type WorkflowState = 'transcription' | 'review' | 'approval' | 'completed' | 'rejected'

export interface WorkflowStep {
    state: WorkflowState
    enteredAt: Date
    completedAt?: Date
    assignee?: string
    notes?: string
}

export interface Workflow extends BaseDocument {
    transcriptionId: string
    currentState: WorkflowState
    steps: WorkflowStep[]
    rejectionReason?: string
}

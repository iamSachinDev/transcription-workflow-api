import { MongoRepository } from '../../db/mongo.repository'
import { Workflow, WorkflowState } from './workflow.model'

export class WorkflowRepository extends MongoRepository<Workflow> {
    constructor() {
        super('workflows')
    }

    async findByTranscriptionId(transcriptionId: string): Promise<Workflow | null> {
        return this.collection.findOne({ transcriptionId })
    }

    async findByState(state: WorkflowState): Promise<Workflow[]> {
        return this.collection.find({ currentState: state }).toArray()
    }

    async createIndexes(): Promise<void> {
        await this.collection.createIndex({ transcriptionId: 1 }, { unique: true })
        await this.collection.createIndex({ currentState: 1 })
        await this.collection.createIndex({ createdAt: -1 })
    }
}

export const workflowRepository = new WorkflowRepository()

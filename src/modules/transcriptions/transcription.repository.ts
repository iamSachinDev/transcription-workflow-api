import { WithId } from 'mongodb'
import { MongoRepository } from '../../db/mongo.repository'
import { Transcription } from './transcription.model'

export class TranscriptionRepository extends MongoRepository<Transcription> {
  constructor() {
    super('transcriptions')
  }

  async create(
    t: Omit<Transcription, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<WithId<Transcription>> {
    const result = await super.create(t as any)
    return result
  }

  async findRecent(days = 30): Promise<Transcription[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return this.collection.find({ createdAt: { $gte: cutoff } }).toArray()
  }

  async findRecentAudioUrl(audioUrl: string): Promise<Transcription | null> {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return this.collection.findOne({ audioUrl, createdAt: { $gte: cutoff } })
  }

  async createIndexes(): Promise<void> {
    await this.collection.createIndex({ createdAt: 1 })
    await this.collection.createIndex({ audioUrl: 1 }, { unique: true })
  }
}

export const transcriptionRepository = new TranscriptionRepository()

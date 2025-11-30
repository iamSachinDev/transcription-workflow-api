import { ObjectId } from 'mongodb'

export interface Transcription {
  _id?: ObjectId
  audioUrl: string
  transcription: string
  source?: string
  createdAt?: Date
  updatedAt?: Date
}

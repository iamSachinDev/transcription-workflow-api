import axios from 'axios'
import { config } from '../../config/env'
import { logger } from '../../lib/logger'
import { AppError } from '../../middleware/errorHandler'
import { Transcription } from './transcription.model'
import { transcriptionRepository } from './transcription.repository'

const { retries = 2, backoffMs = 200 } = config

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const downloadWithRetry = async (url: string): Promise<Buffer> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer', timeout: 5000 })
      return Buffer.from(res.data)
    } catch (err) {
      logger.warn({ err, url, attempt }, 'Download failed')
      if (attempt < retries) {
        const wait = backoffMs * Math.pow(2, attempt)
        logger.info({ wait }, 'Retrying')
        await sleep(wait)
        continue
      }
      throw err
    }
  }
  throw new Error('Unreachable')
}

export const transcribeMock = async (_audio: Buffer): Promise<string> => {
  await sleep(50)
  return 'transcribed text'
}

export const createTranscription = async (
  audioUrl: string,
  source = 'local'
): Promise<Transcription> => {
  const audioExists = await transcriptionRepository.findRecentAudioUrl(audioUrl)
  if (audioExists) throw new AppError('Audio already exists', 409)
  const audio = await downloadWithRetry(audioUrl)
  const transcription = await transcribeMock(audio)
  const record = await transcriptionRepository.create({ audioUrl, transcription, source })
  return record
}

export const updateTranscription = async (
  id: string,
  updates: Partial<Transcription>
): Promise<Transcription> => {
  const existing = await transcriptionRepository.findById(id)
  if (!existing) throw new AppError('Transcription not found', 404)

  const updated = await transcriptionRepository.update(id, updates)
  if (!updated) throw new AppError('Failed to update transcription', 500)

  return updated
}

export const patchTranscription = updateTranscription

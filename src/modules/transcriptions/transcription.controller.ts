import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { asyncHandler } from '../../middleware/asyncHandler'
import { AppError } from '../../middleware/errorHandler'
import { transcriptionRepository } from './transcription.repository'
import * as transcriptionService from './transcription.service'

export const postTranscription = asyncHandler(async (req: Request, res: Response) => {
  const { audioUrl } = req.body as { audioUrl?: string }
  if (!audioUrl) throw new AppError('audioUrl required', 400)
  const rec = await transcriptionService.createTranscription(audioUrl, 'local')
  res.status(201).json({ id: rec._id?.toString() })
})

export const getTranscriptions = asyncHandler(async (_req: Request, res: Response) => {
  const recs = await transcriptionRepository.findRecent(30)
  res.json(recs)
})

export const getRecentTranscriptions = asyncHandler(async (_req: Request, res: Response) => {
  const recs = await transcriptionRepository.findRecent(7)
  res.json(recs)
})

export const getAudio = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  if (!id) throw new AppError('ID required', 400)

  if (!ObjectId.isValid(id)) {
    throw new AppError('Invalid ID format', 400)
  }

  const rec = await transcriptionRepository.findById(id)
  if (!rec) {
    throw new AppError('Transcription not found', 404)
  }

  res.json(rec)
})

export const updateTranscription = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const updates = req.body

  if (!id || !ObjectId.isValid(id)) {
    throw new AppError('Invalid ID format', 400)
  }

  const updated = await transcriptionService.updateTranscription(id, updates)
  res.json(updated)
})

export const patchTranscription = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const updates = req.body

  if (!id || !ObjectId.isValid(id)) {
    throw new AppError('Invalid ID format', 400)
  }

  const updated = await transcriptionService.patchTranscription(id, updates)
  res.json(updated)
})

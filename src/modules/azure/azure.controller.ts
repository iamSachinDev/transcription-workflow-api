import { NextFunction, Request, Response } from 'express'
import { transcriptionRepository } from '../transcriptions/transcription.repository'
import * as azureService from './azure.service'

export const postAzureTranscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { audioUrl, language } = req.body as { audioUrl: string; language?: string }

    const { text, source } = await azureService.transcribeAudio(audioUrl, language)

    const rec = await transcriptionRepository.create({
      audioUrl,
      transcription: text,
      source
    })

    res.status(201).json({ id: rec._id?.toString() })
  } catch (err) {
    next(err)
  }
}

import { z } from 'zod'

const createTranscriptionBody = z.object({
    audioUrl: z.string().url()
})

const updateTranscriptionBody = z.object({
    audioUrl: z.string().url().optional()
})

const patchTranscriptionBody = z.object({
    audioUrl: z.string().url().optional()
})

const getAudioBody = z.object({
    id: z.string().optional()
})

const recentTranscriptionBody = z.object({
    id: z.string().optional()
})

export { createTranscriptionBody, getAudioBody, patchTranscriptionBody, recentTranscriptionBody, updateTranscriptionBody }

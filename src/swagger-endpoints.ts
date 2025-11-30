import express from 'express'
import { postAzureTranscription } from './modules/azure/azure.controller'
import {
    getAudio,
    getRecentTranscriptions,
    getTranscriptions,
    patchTranscription,
    postTranscription,
    updateTranscription,
} from './modules/transcriptions/transcription.controller'
import { getUsers } from './modules/users/user.routes'
import {
    advanceWorkflow,
    createWorkflow,
    getWorkflow,
    getWorkflowsByState,
    rejectWorkflow
} from './modules/workflow/workflow.controller'

const app = express()

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// Users
app.get('/api/users', getUsers)

// Transcriptions
app.get('/api/transcriptions', getTranscriptions)
app.get('/api/transcriptions/recent', getRecentTranscriptions)
app.get('/api/transcriptions/audio/:id', getAudio)
app.post('/api/transcriptions', postTranscription)
app.patch('/api/transcriptions/:id', patchTranscription)
app.put('/api/transcriptions/:id', updateTranscription)

// Azure routes
app.post('/api/azure', postAzureTranscription)

// Workflow routes
app.post('/api/workflows', createWorkflow)
app.get('/api/workflows/:id', getWorkflow)
app.get('/api/workflows', getWorkflowsByState)
app.patch('/api/workflows/:id/advance', advanceWorkflow)
app.patch('/api/workflows/:id/reject', rejectWorkflow)

export default app

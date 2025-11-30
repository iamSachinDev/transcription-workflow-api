import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import app from '../src/app'
import { connectToMongo, disconnectMongo } from '../src/db/mongoClient'

let mongod: MongoMemoryServer

beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    process.env.MONGO_URI = mongod.getUri()
    process.env.MONGO_DB_NAME = 'testdb_workflow'
    await connectToMongo()
}, 30000)

beforeEach(async () => {
    const { getDb } = await import('../src/db/mongoClient')
    await getDb().collection('workflows').deleteMany({})
    await getDb().collection('transcriptions').deleteMany({})
})

afterAll(async () => {
    await disconnectMongo()
    if (mongod) await mongod.stop()
})

describe('Workflow Engine', () => {
    test('POST /api/workflows creates a workflow', async () => {
        const res = await request(app)
            .post('/api/workflows')
            .send({ transcriptionId: 'trans-123', assignee: 'user@example.com' })

        expect(res.status).toBe(201)
        expect(res.body.transcriptionId).toBe('trans-123')
        expect(res.body.currentState).toBe('transcription')
        expect(res.body.steps).toHaveLength(1)
        expect(res.body.steps[0].state).toBe('transcription')
        expect(res.body.steps[0].assignee).toBe('user@example.com')
    })

    test('POST /api/workflows returns 409 for duplicate transcriptionId', async () => {
        await request(app)
            .post('/api/workflows')
            .send({ transcriptionId: 'trans-duplicate' })
            .expect(201)

        const res = await request(app)
            .post('/api/workflows')
            .send({ transcriptionId: 'trans-duplicate' })

        expect(res.status).toBe(409)
    })

    test('GET /api/workflows/:id returns workflow', async () => {
        const created = await request(app)
            .post('/api/workflows')
            .send({ transcriptionId: 'trans-get' })

        const res = await request(app)
            .get(`/api/workflows/${created.body._id}`)

        expect(res.status).toBe(200)
        expect(res.body.transcriptionId).toBe('trans-get')
    })

    test('GET /api/workflows/:id returns 404 for non-existent workflow', async () => {
        const fakeId = '507f1f77bcf86cd799439011'
        const res = await request(app).get(`/api/workflows/${fakeId}`)
        expect(res.status).toBe(404)
    })

    test('PATCH /api/workflows/:id/advance progresses workflow', async () => {
        const created = await request(app)
            .post('/api/workflows')
            .send({ transcriptionId: 'trans-advance' })

        const res = await request(app)
            .patch(`/api/workflows/${created.body._id}/advance`)
            .send({
                targetState: 'review',
                assignee: 'reviewer@example.com',
                notes: 'Ready for review'
            })

        expect(res.status).toBe(200)
        expect(res.body.currentState).toBe('review')
        expect(res.body.steps).toHaveLength(2)
        expect(res.body.steps[1].state).toBe('review')
        expect(res.body.steps[1].assignee).toBe('reviewer@example.com')
        expect(res.body.steps[0].completedAt).toBeDefined()
        expect(res.body.steps[0].notes).toBe('Ready for review')
    })

    test('PATCH /api/workflows/:id/advance validates state transitions', async () => {
        const created = await request(app)
            .post('/api/workflows')
            .send({ transcriptionId: 'trans-invalid' })

        // Try to jump directly to completed (invalid)
        const res = await request(app)
            .patch(`/api/workflows/${created.body._id}/advance`)
            .send({ targetState: 'completed' })

        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/invalid transition/i)
    })

    test('PATCH /api/workflows/:id/reject rejects workflow', async () => {
        const created = await request(app)
            .post('/api/workflows')
            .send({ transcriptionId: 'trans-reject' })

        const res = await request(app)
            .patch(`/api/workflows/${created.body._id}/reject`)
            .send({
                reason: 'Quality issues',
                assignee: 'transcriber@example.com'
            })

        expect(res.status).toBe(200)
        expect(res.body.currentState).toBe('rejected')
        expect(res.body.steps[0].notes).toBe('Quality issues')
    })

    test('GET /api/workflows?state=review filters by state', async () => {
        // Create workflows in different states
        const w1 = await request(app)
            .post('/api/workflows')
            .send({ transcriptionId: 'trans-1' })

        await request(app)
            .patch(`/api/workflows/${w1.body._id}/advance`)
            .send({ targetState: 'review' })

        await request(app)
            .post('/api/workflows')
            .send({ transcriptionId: 'trans-2' })

        const res = await request(app)
            .get('/api/workflows?state=review')

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body).toHaveLength(1)
        expect(res.body[0].currentState).toBe('review')
    })

    test('Complete workflow progression: transcription → review → approval → completed', async () => {
        const created = await request(app)
            .post('/api/workflows')
            .send({ transcriptionId: 'trans-full', assignee: 'transcriber@example.com' })

        expect(created.body.currentState).toBe('transcription')

        // Advance to review
        const review = await request(app)
            .patch(`/api/workflows/${created.body._id}/advance`)
            .send({ targetState: 'review', assignee: 'reviewer@example.com' })

        expect(review.body.currentState).toBe('review')
        expect(review.body.steps).toHaveLength(2)

        // Advance to approval
        const approval = await request(app)
            .patch(`/api/workflows/${created.body._id}/advance`)
            .send({ targetState: 'approval', assignee: 'approver@example.com' })

        expect(approval.body.currentState).toBe('approval')
        expect(approval.body.steps).toHaveLength(3)

        // Complete
        const completed = await request(app)
            .patch(`/api/workflows/${created.body._id}/advance`)
            .send({ targetState: 'completed' })

        expect(completed.body.currentState).toBe('completed')
        expect(completed.body.steps).toHaveLength(4)
        expect(completed.body.steps.every((s: any) => s.completedAt || s.state === 'completed')).toBe(true)
    })

    test('Rejection flow: review → rejected → transcription', async () => {
        const created = await request(app)
            .post('/api/workflows')
            .send({ transcriptionId: 'trans-reject-flow' })

        // Advance to review
        await request(app)
            .patch(`/api/workflows/${created.body._id}/advance`)
            .send({ targetState: 'review' })

        // Reject
        const rejected = await request(app)
            .patch(`/api/workflows/${created.body._id}/reject`)
            .send({ reason: 'Needs correction' })

        expect(rejected.body.currentState).toBe('rejected')

        // Return to transcription
        const backToTranscription = await request(app)
            .patch(`/api/workflows/${created.body._id}/advance`)
            .send({ targetState: 'transcription' })

        expect(backToTranscription.body.currentState).toBe('transcription')
        expect(backToTranscription.body.steps).toHaveLength(4)
    })
})

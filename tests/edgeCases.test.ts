import axios from 'axios'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import app from '../src/app'
import { connectToMongo, disconnectMongo } from '../src/db/mongoClient'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

let mongod: MongoMemoryServer

beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    process.env.MONGO_URI = mongod.getUri()
    process.env.MONGO_DB_NAME = 'testdb_edge'
    await connectToMongo()
}, 30000)

beforeEach(async () => {
    const { getDb } = await import('../src/db/mongoClient')
    await getDb().collection('transcriptions').deleteMany({})
})

afterAll(async () => {
    await disconnectMongo()
    if (mongod) await mongod.stop()
})

describe('Edge Cases', () => {
    test('POST /api/transcriptions returns 409 for duplicate audio', async () => {
        mockedAxios.get.mockResolvedValue({ data: Buffer.from('fake audio') })

        // First create
        await request(app)
            .post('/api/transcriptions')
            .send({ audioUrl: 'https://example.com/duplicate.mp3' })
            .expect(201)

        // Second create (should fail)
        const res = await request(app)
            .post('/api/transcriptions')
            .send({ audioUrl: 'https://example.com/duplicate.mp3' })

        expect(res.status).toBe(409)
        expect(res.body.message).toMatch(/already exists/i)
    })

    test('GET /api/transcriptions/audio/:id returns 404 for non-existent ID', async () => {
        const fakeId = '507f1f77bcf86cd799439011' // Valid ObjectId but not in DB
        const res = await request(app).get(`/api/transcriptions/audio/${fakeId}`)
        expect(res.status).toBe(404)
    })

    test('GET /api/transcriptions/audio/:id returns 400 for invalid ID format', async () => {
        const res = await request(app).get('/api/transcriptions/audio/invalid-id')
        expect(res.status).toBe(400)
    })

    test('Repository update sets updatedAt', async () => {
        const { transcriptionRepository } = await import('../src/modules/transcriptions/transcription.repository')

        // Create directly via repo to get ID
        const created = await transcriptionRepository.create({
            audioUrl: 'https://example.com/update-test.mp3',
            transcription: 'original',
            source: 'local'
        })

        const id = created._id
        expect(created.createdAt).toBeDefined()
        expect(created.updatedAt).toBeDefined()
        // Timestamps might be slightly different if creation takes time, but should be close
        expect(created.createdAt?.getTime()).toBeCloseTo(created.updatedAt!.getTime(), -2)

        // Wait a bit to ensure timestamp difference
        await new Promise(r => setTimeout(r, 100))

        // Update
        await transcriptionRepository.update(id!, { transcription: 'updated' })

        const updated = await transcriptionRepository.findOne({ _id: id })
        expect(updated).toBeDefined()
        expect(updated?.transcription).toBe('updated')

        const createdAt = updated!.createdAt?.getTime() || 0
        const updatedAt = updated!.updatedAt?.getTime() || 0

        expect(updatedAt).toBeGreaterThan(createdAt)
    })

    test('PUT /api/transcriptions/:id updates record', async () => {
        const { transcriptionRepository } = await import('../src/modules/transcriptions/transcription.repository')
        const created = await transcriptionRepository.create({
            audioUrl: 'https://example.com/put-test.mp3',
            transcription: 'original',
            source: 'local'
        })

        const res = await request(app)
            .put(`/api/transcriptions/${created._id}`)
            .send({ audioUrl: 'https://example.com/updated.mp3' })

        expect(res.status).toBe(200)
        expect(res.body.audioUrl).toBe('https://example.com/updated.mp3')

        const updated = await transcriptionRepository.findOne({ _id: created._id })
        expect(updated?.audioUrl).toBe('https://example.com/updated.mp3')
    })

    test('PATCH /api/transcriptions/:id updates record', async () => {
        const { transcriptionRepository } = await import('../src/modules/transcriptions/transcription.repository')
        const created = await transcriptionRepository.create({
            audioUrl: 'https://example.com/patch-test.mp3',
            transcription: 'original',
            source: 'local'
        })

        const res = await request(app)
            .patch(`/api/transcriptions/${created._id}`)
            .send({ audioUrl: 'https://example.com/patched.mp3' })

        expect(res.status).toBe(200)
        expect(res.body.audioUrl).toBe('https://example.com/patched.mp3')

        const updated = await transcriptionRepository.findOne({ _id: created._id })
        expect(updated?.audioUrl).toBe('https://example.com/patched.mp3')
    })
})

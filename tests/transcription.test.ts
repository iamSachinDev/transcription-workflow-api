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
  process.env.MONGO_DB_NAME = 'testdb'
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

test('POST /api/transcriptions creates a transcription', async () => {
  mockedAxios.get.mockResolvedValue({ data: Buffer.from('fake audio') })
  const res = await request(app).post('/api/transcriptions').send({ audioUrl: 'https://example.com/sample.mp3' })
  expect(res.status).toBe(201)
  expect(res.body).toHaveProperty('id')
})

test('GET /api/transcriptions returns array', async () => {
  const res = await request(app).get('/api/transcriptions')
  expect(res.status).toBe(200)
  expect(Array.isArray(res.body)).toBe(true)
})

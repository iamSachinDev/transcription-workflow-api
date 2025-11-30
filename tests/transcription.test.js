'use strict'
const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod }
}
Object.defineProperty(exports, '__esModule', { value: true })
const supertest_1 = __importDefault(require('supertest'))
const mongodb_memory_server_1 = require('mongodb-memory-server')
const app_1 = __importDefault(require('../src/app'))
const mongoClient_1 = require('../src/db/mongoClient')
let mongod
beforeAll(async () => {
  mongod = await mongodb_memory_server_1.MongoMemoryServer.create()
  process.env.MONGO_URI = mongod.getUri()
  process.env.MONGO_DB_NAME = 'testdb'
  await (0, mongoClient_1.connectToMongo)()
})
afterAll(async () => {
  await (0, mongoClient_1.disconnectMongo)()
  if (mongod) { await mongod.stop() }
})
test('POST /api/transcriptions creates a transcription', async () => {
  const res = await (0, supertest_1.default)(app_1.default).post('/api/transcriptions').send({ audioUrl: 'https://example.com/sample.mp3' })
  expect(res.status).toBe(201)
  expect(res.body).toHaveProperty('id')
})
test('GET /api/transcriptions returns array', async () => {
  const res = await (0, supertest_1.default)(app_1.default).get('/api/transcriptions')
  expect(res.status).toBe(200)
  expect(Array.isArray(res.body)).toBe(true)
})

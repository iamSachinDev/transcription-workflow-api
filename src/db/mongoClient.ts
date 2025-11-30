import { Db, MongoClient } from 'mongodb'
import { config } from '../config/env'
import { logger } from '../lib/logger'

let client: MongoClient | null = null
let db: Db | null = null

export const connectToMongo = async (): Promise<Db> => {
  if (db) return db
  client = new MongoClient(config.mongoUri)
  await client.connect()
  db = client.db(config.mongoDbName)
  logger.info({ dbName: config.mongoDbName }, 'Connected to MongoDB')
  return db
}

export const getDb = (): Db => {
  if (!db) throw new Error('MongoDB not connected')
  return db
}

export const disconnectMongo = async (): Promise<void> => {
  if (client) {
    await client.close()
    client = null
    db = null
    logger.info('Disconnected MongoDB')
  }
}

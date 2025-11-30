import dotenv from 'dotenv'

dotenv.config()

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '7777', 10),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017',
  mongoDbName: process.env.MONGO_DB_NAME ?? 'transcription_db',
  serviceId: process.env.SERVICE_ID ?? 'transcription-service',
  featureFlagsJson: process.env.FEATURE_FLAGS ?? '{}',
  retries: parseInt(process.env.RETRIES ?? '2', 10),
  backoffMs: parseInt(process.env.BACKOFF_MS ?? '200', 10),
  // Security config
  corsOrigins: process.env.CORS_ORIGINS ?? '*',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100', 10),
  compressionLevel: parseInt(process.env.COMPRESSION_LEVEL ?? '6', 10),
  compressionThreshold: parseInt(process.env.COMPRESSION_THRESHOLD ?? '1024', 10),
  // Azure
  azureSpeechKey: process.env.AZURE_SPEECH_KEY,
  azureRegion: process.env.AZURE_REGION
}

# VoiceOWL - Transcription Service

> Production-ready Node.js + TypeScript + Express + MongoDB transcription service with enterprise-grade security and feature flags.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.8-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Features

- ✅ **RESTful API** - Clean Express.js architecture with TypeScript
- ✅ **MongoDB Integration** - Generic repository pattern with indexing for scalability
- ✅ **Azure Speech-to-Text** - Integration with mock fallback and retry logic
- ✅ **Workflow Engine** - State machine for transcription → review → approval
- ✅ **Feature Flags** - Dynamic feature control via environment variables
- ✅ **Security First** - Helmet, CORS, rate limiting, compression
- ✅ **Auto-Generated Swagger Docs** - Interactive API documentation
- ✅ **Comprehensive Testing** - Jest with 37+ test cases
- ✅ **Auto-Linting** - Standard linter with auto-fix on save
- ✅ **Production Ready** - Optimized dependencies and build process

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Feature Flags](#feature-flags)
- [Security](#security)
- [Development](#development)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [Architecture](#architecture)

## 🏁 Quick Start

### Prerequisites

- Node.js 20+ 
- MongoDB 6.8+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd voiceOWL

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start MongoDB (if not running)
mongod

# Start development server
npm run dev
```

Server will start on `http://localhost:7777`

### Access Swagger Documentation

Visit: **`http://localhost:7777/api-docs`**

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Users
| Endpoint | Method | Feature Flag | Description |
|----------|--------|--------------|-------------|
| `/api/users` | GET | `users.list` | List all users |

### Transcriptions
| Endpoint | Method | Feature Flag | Description |
|----------|--------|--------------|-------------|
| `/api/transcriptions` | GET | `transcriptions.list` | List all (30 days) |
| `/api/transcriptions/recent` | GET | `transcriptions.recent` | Recent (7 days) |
| `/api/transcriptions/audio/:id` | GET | `transcriptions.getOne` | Get audio by ID |
| `/api/transcriptions` | POST | `transcriptions.create` | Create transcription |
| `/api/transcriptions/:id` | PUT | `transcriptions.update` | Update transcription |
| `/api/transcriptions/:id` | PATCH | `transcriptions.update` | Partial update |

### Azure Integration
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/azure` | POST | Azure Speech-to-Text (with mock fallback) |

### Workflow Engine
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/workflows` | POST | Create workflow |
| `/api/workflows/:id` | GET | Get workflow status |
| `/api/workflows?state=X` | GET | Query workflows by state |
| `/api/workflows/:id/advance` | PATCH | Advance to next state |
| `/api/workflows/:id/reject` | PATCH | Reject and revert |

## 🎛️ Feature Flags

Control features dynamically via `.env`:

```json
{
  "modules": {
    "users": true,
    "transcriptions": true
  },
  "features": {
    "users": {
      "list": true
    },
    "transcriptions": {
      "create": true,
      "list": true,
      "recent": false,  // Disabled
      "getOne": true
    }
  }
}
```

### Auto-Detection

Routes automatically map HTTP methods to features:
- `GET` → `list`
- `POST` → `create`
- `PUT/PATCH` → `update`
- `DELETE` → `delete`

Override with specific feature names when needed.

## 🔒 Security

### Implemented Security Features

- **Helmet** - Secure HTTP headers
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Compression** - Gzip compression for responses

### Configuration (`.env`)

```bash
CORS_ORIGINS=*  # Production: https://yourdomain.com,https://app.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
COMPRESSION_LEVEL=6
COMPRESSION_THRESHOLD=1024
```

## 📝 Logging

The service uses **Pino** for high-performance structured logging.

- **Header Masking**: Sensitive headers (`Authorization`, `Cookie`, etc.) are automatically redacted.
- **Correlation IDs**: Requests are tracked via `x-correlation-id` header or auto-generated UUIDs.
- **Health Checks**: `/health` and `/favicon.ico` logs are suppressed to reduce noise.
- **Structured Data**: Logs include `serviceId`, `userId`, and `correlationId` for easy tracing.

## 💻 Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run lint         # Run linter
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run swagger-gen  # Generate Swagger documentation
```

### Project Structure

```
voiceOWL/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts              # Server entry point
│   ├── config/                # Configuration
│   │   ├── env.ts            # Environment variables
│   │   └── features.ts       # Feature flags
│   ├── db/                    # Database
│   │   ├── mongoClient.ts    # MongoDB connection
│   │   ├── mongo.repository.ts # Generic repository
│   │   └── base.repository.ts
│   ├── middleware/            # Express middleware
│   │   ├── errorHandler.ts
│   │   ├── featureFlag.ts    # Feature flag middleware
│   │   ├── requestLogger.ts
│   │   └── validate.ts
│   ├── modules/               # Feature modules
│   │   ├── users/
│   │   ├── transcriptions/
│   │   └── azure/
│   └── lib/                   # Utilities
├── tests/                     # Test files
├── dist/                      # Compiled JavaScript
└── .env                       # Environment variables
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- featureFlag.test.ts
```

**Test Coverage:**
- 37 tests total across 5 suites
- Feature flag middleware (13 tests)
- Transcription endpoints (8 tests)
- Azure integration (6 tests)
- Workflow engine (10 tests)

## 🚢 Production Deployment

### Build

```bash
npm run build
```

### Environment Variables

Update `.env` for production:

```bash
NODE_ENV=production
PORT=7777
MONGO_URI=mongodb://production-server:27017
MONGO_DB_NAME=transcription_prod
SERVICE_ID=transcription-service
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FEATURE_FLAGS={"modules":{"users":true,"transcriptions":true},"features":{"users":{"list":true},"transcriptions":{"create":true,"list":true,"recent":true,"getOne":true}}}
```

### Start Production Server

```bash
npm start
```

### Docker (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 7777
CMD ["node", "dist/server.js"]
```

## 🏗️ Architecture

### Design Patterns

- **Generic Repository Pattern** - Reusable MongoDB operations
- **Feature Flag Pattern** - Dynamic feature control
- **Middleware Pattern** - Composable request processing
- **Module Pattern** - Organized feature modules

### Key Technologies

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.6
- **Framework**: Express 4.21
- **Database**: MongoDB 6.8
- **Validation**: Zod
- **Testing**: Jest
- **Linting**: ESLint with neostandard
- **Documentation**: Swagger/OpenAPI

## 📝 Database Indexes

For optimal performance with large datasets:

```javascript
// Create index on createdAt
db.transcriptions.createIndex({ createdAt: 1 })

// Compound index for filtered queries
db.transcriptions.createIndex({ source: 1, createdAt: 1 })
```

## 🔄 Scaling Considerations

- **Background Processing** - Move heavy downloads/transcriptions to queue workers
- **Containerization** - Docker + Kubernetes for autoscaling
- **Caching** - Redis for hot reads
- **Load Balancing** - Nginx or cloud load balancers
- **Database Sharding** - MongoDB sharding for massive scale

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

---

**Built with ❤️ using Node.js, TypeScript, and MongoDB**

## Indexing Strategy (100M+ Records)

For a dataset of 100M+ records, efficient indexing is crucial for performance:

1.  **Compound Index on `createdAt`**:
    *   **Query**: `GET /transcriptions` (last 30 days).
    *   **Index**: `{ createdAt: 1 }` or `{ createdAt: -1 }`.
    *   **Reasoning**: Allows MongoDB to efficiently filter range queries on dates without scanning the entire collection.

2.  **Unique Index on `audioUrl`**:
    *   **Query**: Duplicate check on creation.
    *   **Index**: `{ audioUrl: 1 }` (Unique).
    *   **Reasoning**: Enforces data integrity at the database level and provides O(1) lookups for existence checks.

3.  **Sharding (Future Consideration)**:
    *   If the dataset grows beyond single-node capacity, shard by a hashed key (e.g., `_id` or `userId`) to distribute write load and storage.

## Scalability & System Design (10k+ Concurrent Requests)

To evolve the service for high concurrency:

1.  **Caching (Redis)**:
    *   Cache frequent GET responses (e.g., `/recent`) to reduce DB load.
    *   Use Redis for rate limiting counters instead of in-memory.

2.  **Message Queues (BullMQ /RabbitMQ / Kafka)**:
    *   Decouple ingestion from processing.
    *   `POST /transcriptions` pushes a job to a queue and returns `202 Accepted` immediately.
    *   Worker services consume the queue and process transcriptions asynchronously.

3.  **Horizontal Scaling & Containerization**:
    *   **Docker/Kubernetes**: Containerize the app and orchestrate with K8s.
    *   **Autoscaling**: Configure HPA (Horizontal Pod Autoscaler) to add replicas based on CPU/Memory usage.
    *   **Load Balancer**: Distribute traffic across multiple instances (e.g., Nginx, AWS ALB).

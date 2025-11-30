import swaggerAutogen from 'swagger-autogen'

const doc = {
  info: {
    title: 'Transcription Service API',
    description: 'API documentation for the Transcription Service'
  },
  host: 'localhost:7777',
  schemes: ['http']
}

const outputFile = './swagger_output.json'
const endpointsFiles = ['./src/swagger-endpoints.ts']

swaggerAutogen()(outputFile, endpointsFiles, doc)

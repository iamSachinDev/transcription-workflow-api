import { NextFunction, Request, Response } from 'express'
import * as features from '../../src/config/features'
import { autoRequireFeature, requireFeature } from '../../src/middleware/featureFlag'

// Mock the features module
jest.mock('../../src/config/features')

describe('Feature Flag Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: NextFunction

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {}
    nextFunction = jest.fn()
    jest.clearAllMocks()
  })

  describe('requireFeature', () => {
    it('should call next() when feature is enabled', () => {
      jest.spyOn(features, 'isFeatureEnabled').mockReturnValue(true)

      const middleware = requireFeature('transcriptions', 'create')
      middleware(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(features.isFeatureEnabled).toHaveBeenCalledWith('transcriptions', 'create')
      expect(nextFunction).toHaveBeenCalledWith()
    })

    it('should call next() with AppError when feature is disabled', () => {
      jest.spyOn(features, 'isFeatureEnabled').mockReturnValue(false)

      const middleware = requireFeature('transcriptions', 'create')
      middleware(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(features.isFeatureEnabled).toHaveBeenCalledWith('transcriptions', 'create')
      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Feature 'transcriptions.create' is disabled",
          statusCode: 403
        })
      )
    })

    it('should work with different module and feature combinations', () => {
      jest.spyOn(features, 'isFeatureEnabled').mockReturnValue(true)

      const middleware = requireFeature('users', 'list')
      middleware(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(features.isFeatureEnabled).toHaveBeenCalledWith('users', 'list')
      expect(nextFunction).toHaveBeenCalledWith()
    })
  })

  describe('autoRequireFeature', () => {
    describe('Auto-detection from HTTP method', () => {
      it('should auto-detect "list" for GET requests', () => {
        mockRequest.method = 'GET'
        jest.spyOn(features, 'isFeatureEnabled').mockReturnValue(true)

        const middleware = autoRequireFeature('transcriptions')
        middleware(mockRequest as Request, mockResponse as Response, nextFunction)

        expect(features.isFeatureEnabled).toHaveBeenCalledWith('transcriptions', 'list')
        expect(nextFunction).toHaveBeenCalledWith()
      })

      it('should auto-detect "create" for POST requests', () => {
        mockRequest.method = 'POST'
        jest.spyOn(features, 'isFeatureEnabled').mockReturnValue(true)

        const middleware = autoRequireFeature('transcriptions')
        middleware(mockRequest as Request, mockResponse as Response, nextFunction)

        expect(features.isFeatureEnabled).toHaveBeenCalledWith('transcriptions', 'create')
        expect(nextFunction).toHaveBeenCalledWith()
      })

      it('should auto-detect "update" for PUT requests', () => {
        mockRequest.method = 'PUT'
        jest.spyOn(features, 'isFeatureEnabled').mockReturnValue(true)

        const middleware = autoRequireFeature('users')
        middleware(mockRequest as Request, mockResponse as Response, nextFunction)

        expect(features.isFeatureEnabled).toHaveBeenCalledWith('users', 'update')
        expect(nextFunction).toHaveBeenCalledWith()
      })

      it('should auto-detect "update" for PATCH requests', () => {
        mockRequest.method = 'PATCH'
        jest.spyOn(features, 'isFeatureEnabled').mockReturnValue(true)

        const middleware = autoRequireFeature('users')
        middleware(mockRequest as Request, mockResponse as Response, nextFunction)

        expect(features.isFeatureEnabled).toHaveBeenCalledWith('users', 'update')
        expect(nextFunction).toHaveBeenCalledWith()
      })

      it('should auto-detect "delete" for DELETE requests', () => {
        mockRequest.method = 'DELETE'
        jest.spyOn(features, 'isFeatureEnabled').mockReturnValue(true)

        const middleware = autoRequireFeature('users')
        middleware(mockRequest as Request, mockResponse as Response, nextFunction)

        expect(features.isFeatureEnabled).toHaveBeenCalledWith('users', 'delete')
        expect(nextFunction).toHaveBeenCalledWith()
      })

      it('should allow through for unmapped HTTP methods', () => {
        mockRequest.method = 'OPTIONS'

        const middleware = autoRequireFeature('transcriptions')
        middleware(mockRequest as Request, mockResponse as Response, nextFunction)

        expect(features.isFeatureEnabled).not.toHaveBeenCalled()
        expect(nextFunction).toHaveBeenCalledWith()
      })
    })

    describe('Feature override', () => {
      it('should use override instead of auto-detection', () => {
        mockRequest.method = 'GET'
        jest.spyOn(features, 'isFeatureEnabled').mockReturnValue(true)

        const middleware = autoRequireFeature('transcriptions', 'recent')
        middleware(mockRequest as Request, mockResponse as Response, nextFunction)

        expect(features.isFeatureEnabled).toHaveBeenCalledWith('transcriptions', 'recent')
        expect(nextFunction).toHaveBeenCalledWith()
      })

      it('should block request when overridden feature is disabled', () => {
        mockRequest.method = 'GET'
        jest.spyOn(features, 'isFeatureEnabled').mockReturnValue(false)

        const middleware = autoRequireFeature('transcriptions', 'getOne')
        middleware(mockRequest as Request, mockResponse as Response, nextFunction)

        expect(features.isFeatureEnabled).toHaveBeenCalledWith('transcriptions', 'getOne')
        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Feature 'transcriptions.getOne' is disabled",
            statusCode: 403
          })
        )
      })
    })

    describe('Feature disabled scenarios', () => {
      it('should block GET request when list feature is disabled', () => {
        mockRequest.method = 'GET'
        jest.spyOn(features, 'isFeatureEnabled').mockReturnValue(false)

        const middleware = autoRequireFeature('transcriptions')
        middleware(mockRequest as Request, mockResponse as Response, nextFunction)

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Feature 'transcriptions.list' is disabled",
            statusCode: 403
          })
        )
      })

      it('should block POST request when create feature is disabled', () => {
        mockRequest.method = 'POST'
        jest.spyOn(features, 'isFeatureEnabled').mockReturnValue(false)

        const middleware = autoRequireFeature('transcriptions')
        middleware(mockRequest as Request, mockResponse as Response, nextFunction)

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Feature 'transcriptions.create' is disabled",
            statusCode: 403
          })
        )
      })
    })
  })
})

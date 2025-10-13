// tests/unit/auth.test.js

// Mock dependencies BEFORE requiring modules
jest.mock('aws-jwt-verify');
jest.mock('../../src/logger');

// Setup mocks before requiring auth
const { CognitoJwtVerifier } = require('aws-jwt-verify');

const mockVerifier = {
  verify: jest.fn(),
  hydrate: jest.fn().mockResolvedValue(undefined)
};

CognitoJwtVerifier.create = jest.fn().mockReturnValue(mockVerifier);

// Now require auth after mocks are setup
const auth = require('../../src/auth');
const passport = require('passport');

describe('Auth Tests', () => {
  describe('Module Initialization', () => {
    test('should export strategy function', () => {
      expect(auth.strategy).toBeDefined();
      expect(typeof auth.strategy).toBe('function');
    });

    test('should export authenticate function', () => {
      expect(auth.authenticate).toBeDefined();
      expect(typeof auth.authenticate).toBe('function');
    });

    test('should create CognitoJwtVerifier with correct config', () => {
      expect(CognitoJwtVerifier.create).toHaveBeenCalledWith({
        userPoolId: process.env.AWS_COGNITO_POOL_ID,
        clientId: process.env.AWS_COGNITO_CLIENT_ID,
        tokenUse: 'id'
      });
    });

    test('should call hydrate on verifier', () => {
      expect(mockVerifier.hydrate).toHaveBeenCalled();
    });
  });

  describe('Bearer Strategy', () => {
    test('should return a bearer strategy', () => {
      const strategy = auth.strategy();
      expect(strategy).toBeDefined();
      expect(strategy.name).toBe('bearer');
    });

    test('should verify valid token successfully', async () => {
      const mockPayload = {
        sub: 'user123',
        email: 'test@example.com',
        'cognito:username': 'testuser'
      };

      mockVerifier.verify.mockResolvedValue(mockPayload);

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('valid-token', done);

      expect(mockVerifier.verify).toHaveBeenCalledWith('valid-token');
      expect(done).toHaveBeenCalledWith(null, mockPayload);
    });

    test('should reject invalid token', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Invalid token'));

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('invalid-token', done);

      expect(mockVerifier.verify).toHaveBeenCalledWith('invalid-token');
      expect(done).toHaveBeenCalledWith(null, false);
    });

    test('should reject expired token', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Token expired'));

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('expired-token', done);

      expect(done).toHaveBeenCalledWith(null, false);
    });

    test('should handle malformed token', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Malformed token'));

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('malformed-token', done);

      expect(done).toHaveBeenCalledWith(null, false);
    });

    test('should handle empty token', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Token required'));

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('', done);

      expect(done).toHaveBeenCalledWith(null, false);
    });

    test('should handle null token', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Token required'));

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify(null, done);

      expect(done).toHaveBeenCalledWith(null, false);
    });
  });

  describe('Authentication Middleware', () => {
    test('should return passport authenticate middleware', () => {
      const middleware = auth.authenticate();
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });

    test('should use bearer strategy without session', () => {
      const authenticateSpy = jest.spyOn(passport, 'authenticate');
      auth.authenticate();

      expect(authenticateSpy).toHaveBeenCalledWith('bearer', { session: false });
    });
  });

  describe('Token Verification Edge Cases', () => {
    test('should handle token with special characters', async () => {
      const specialToken = 'token.with.dots-and_underscores';
      const mockPayload = { sub: 'user123' };

      mockVerifier.verify.mockResolvedValue(mockPayload);

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify(specialToken, done);

      expect(mockVerifier.verify).toHaveBeenCalledWith(specialToken);
      expect(done).toHaveBeenCalledWith(null, mockPayload);
    });

    test('should handle very long token', async () => {
      const longToken = 'a'.repeat(2000);
      const mockPayload = { sub: 'user123' };

      mockVerifier.verify.mockResolvedValue(mockPayload);

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify(longToken, done);

      expect(mockVerifier.verify).toHaveBeenCalledWith(longToken);
      expect(done).toHaveBeenCalledWith(null, mockPayload);
    });

    test('should handle token verification timeout', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Verification timeout'));

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('timeout-token', done);

      expect(done).toHaveBeenCalledWith(null, false);
    });

    test('should handle network error during verification', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Network error'));

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('valid-token', done);

      expect(done).toHaveBeenCalledWith(null, false);
    });
  });

  describe('User Payload Handling', () => {
    test('should pass complete user payload', async () => {
      const mockPayload = {
        sub: 'user123',
        email: 'test@example.com',
        'cognito:username': 'testuser',
        'cognito:groups': ['admin', 'users'],
        email_verified: true,
        iss: 'https://cognito.amazonaws.com',
        aud: 'client-id',
        token_use: 'id'
      };

      mockVerifier.verify.mockResolvedValue(mockPayload);

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('valid-token', done);

      expect(done).toHaveBeenCalledWith(null, mockPayload);
    });

    test('should handle minimal user payload', async () => {
      const mockPayload = {
        sub: 'user123'
      };

      mockVerifier.verify.mockResolvedValue(mockPayload);

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('valid-token', done);

      expect(done).toHaveBeenCalledWith(null, mockPayload);
    });
  });

  describe('Error Scenarios', () => {
    test('should handle JWT signature verification failure', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Signature verification failed'));

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('bad-signature-token', done);

      expect(done).toHaveBeenCalledWith(null, false);
    });

    test('should handle JWT algorithm mismatch', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Algorithm mismatch'));

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('wrong-algorithm-token', done);

      expect(done).toHaveBeenCalledWith(null, false);
    });

    test('should handle invalid issuer', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Invalid issuer'));

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('wrong-issuer-token', done);

      expect(done).toHaveBeenCalledWith(null, false);
    });

    test('should handle invalid audience', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Invalid audience'));

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('wrong-audience-token', done);

      expect(done).toHaveBeenCalledWith(null, false);
    });

    test('should handle token used before valid time', async () => {
      mockVerifier.verify.mockRejectedValue(new Error('Token used before valid'));

      const strategy = auth.strategy();
      const done = jest.fn();

      await strategy._verify('not-yet-valid-token', done);

      expect(done).toHaveBeenCalledWith(null, false);
    });
  });

  describe('Cognito JWKS Hydration', () => {
    test('should handle hydration success', async () => {
      // This is tested during module initialization
      expect(mockVerifier.hydrate).toHaveBeenCalled();
    });
  });

  describe('Environment Configuration', () => {
    test('should use environment variables for configuration', () => {
      expect(CognitoJwtVerifier.create).toHaveBeenCalledWith({
        userPoolId: process.env.AWS_COGNITO_POOL_ID,
        clientId: process.env.AWS_COGNITO_CLIENT_ID,
        tokenUse: 'id'
      });
    });

    test('should configure token use as id', () => {
      expect(CognitoJwtVerifier.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenUse: 'id'
        })
      );
    });
  });
});

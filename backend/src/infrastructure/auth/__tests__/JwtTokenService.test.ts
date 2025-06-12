import { JwtTokenService } from '../services/JwtTokenService';
import { TokenPayload } from '../../../domain/ports/ITokenService';
import jwt from 'jsonwebtoken';

describe('JwtTokenService', () => {
  const secret = 'test-secret';
  const validPayload: TokenPayload = {
    userId: 'user123',
    email: 'test@example.com',
  };

  let service: JwtTokenService;

  beforeEach(() => {
    service = new JwtTokenService(secret);
  });

  describe('constructor', () => {
    it('should throw error for empty secret', () => {
      expect(() => new JwtTokenService('')).toThrow('JWT secret is required');
    });

    it('should create instance with custom expiration', () => {
      const customService = new JwtTokenService(secret, '1h');
      expect(customService).toBeInstanceOf(JwtTokenService);
    });
  });

  describe('generate', () => {
    it('should generate valid JWT token', async () => {
      const token = await service.generate(validPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, secret) as TokenPayload;
      expect(decoded.userId).toBe(validPayload.userId);
      expect(decoded.email).toBe(validPayload.email);
    });

    it('should throw error for missing userId', async () => {
      const invalidPayload = { email: 'test@example.com' } as TokenPayload;
      await expect(service.generate(invalidPayload)).rejects.toThrow(
        'Token payload must contain userId and email',
      );
    });

    it('should throw error for missing email', async () => {
      const invalidPayload = { userId: 'user123' } as TokenPayload;
      await expect(service.generate(invalidPayload)).rejects.toThrow(
        'Token payload must contain userId and email',
      );
    });

    it('should include expiration in token', async () => {
      const token = await service.generate(validPayload);
      const decoded = jwt.decode(token, { complete: true });
      expect(decoded?.payload).toHaveProperty('exp');
    });
  });

  describe('verify', () => {
    it('should verify and decode valid token', async () => {
      const token = await service.generate(validPayload);
      const decoded = await service.verify(token);

      expect(decoded).toEqual(validPayload);
    });

    it('should throw error for empty token', async () => {
      await expect(service.verify('')).rejects.toThrow('Token is required');
    });

    it('should throw error for invalid token', async () => {
      await expect(service.verify('invalid-token')).rejects.toThrow('Invalid token');
    });

    it('should throw error for expired token', async () => {
      const shortExpirationService = new JwtTokenService(secret, '1ms');
      const token = await shortExpirationService.generate(validPayload);

      await new Promise((resolve) => setTimeout(resolve, 2));

      await expect(shortExpirationService.verify(token)).rejects.toThrow('Token has expired');
    });

    it('should throw error for token with invalid payload structure', async () => {
      const invalidToken = jwt.sign({ foo: 'bar' }, secret);

      await expect(service.verify(invalidToken)).rejects.toThrow('Invalid token payload');
    });
  });
});

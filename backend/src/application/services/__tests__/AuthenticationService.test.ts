import { AuthenticationService } from '../AuthenticationService';
import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { IPasswordService } from '../../../domain/ports/IPasswordService';
import { ITokenService } from '../../../domain/ports/ITokenService';
import { TokenPayload } from '../../../domain/ports/ITokenService';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordService: jest.Mocked<IPasswordService>;
  let mockTokenService: jest.Mocked<ITokenService>;

  const testUser = User.create({
    id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword123',
  });

  const testToken = 'valid.jwt.token';
  const testPayload: TokenPayload = {
    userId: testUser.id,
    email: testUser.getEmail(),
  };

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    mockPasswordService = {
      hash: jest.fn(),
      verify: jest.fn(),
    };

    mockTokenService = {
      generate: jest.fn(),
      verify: jest.fn(),
    };

    service = new AuthenticationService(mockUserRepository, mockPasswordService, mockTokenService);
  });

  describe('authenticate', () => {
    it('should authenticate user with valid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockPasswordService.verify.mockResolvedValue(true);
      mockTokenService.generate.mockResolvedValue(testToken);

      const result = await service.authenticate('test@example.com', 'correctPassword');

      expect(result.user).toBe(testUser);
      expect(result.token).toBe(testToken);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockPasswordService.verify).toHaveBeenCalledWith(
        'correctPassword',
        testUser.getHashedPassword(),
      );
    });

    it('should throw error for empty email', async () => {
      await expect(service.authenticate('', 'password')).rejects.toThrow(
        'Email and password are required',
      );
    });

    it('should throw error for empty password', async () => {
      await expect(service.authenticate('test@example.com', '')).rejects.toThrow(
        'Email and password are required',
      );
    });

    it('should throw error for non-existent user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.authenticate('nonexistent@example.com', 'password')).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('should throw error for invalid password', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockPasswordService.verify.mockResolvedValue(false);

      await expect(service.authenticate('test@example.com', 'wrongPassword')).rejects.toThrow(
        'Invalid email or password',
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token and return user', async () => {
      mockTokenService.verify.mockResolvedValue(testPayload);
      mockUserRepository.findById.mockResolvedValue(testUser);

      const result = await service.verifyToken(testToken);

      expect(result).toBe(testUser);
      expect(mockTokenService.verify).toHaveBeenCalledWith(testToken);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(testUser.id);
    });

    it('should throw error for empty token', async () => {
      await expect(service.verifyToken('')).rejects.toThrow('Token is required');
    });

    it('should throw error when user not found', async () => {
      mockTokenService.verify.mockResolvedValue(testPayload);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.verifyToken(testToken)).rejects.toThrow('User not found');
    });

    it('should throw error when token email does not match user email', async () => {
      const differentUser = User.create({
        id: testUser.id,
        email: 'different@example.com',
        password: 'hashedPassword123',
      });

      mockTokenService.verify.mockResolvedValue(testPayload);
      mockUserRepository.findById.mockResolvedValue(differentUser);

      await expect(service.verifyToken(testToken)).rejects.toThrow('Invalid token');
    });
  });

  describe('generateToken', () => {
    it('should generate token for valid user', async () => {
      mockTokenService.generate.mockResolvedValue(testToken);

      const result = await service.generateToken(testUser);

      expect(result).toBe(testToken);
      expect(mockTokenService.generate).toHaveBeenCalledWith({
        userId: testUser.id,
        email: testUser.getEmail(),
      });
    });

    it('should throw error for null user', async () => {
      await expect(service.generateToken(null as any)).rejects.toThrow('User is required');
    });
  });
});

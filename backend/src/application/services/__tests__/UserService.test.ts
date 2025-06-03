import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { UserService } from '../UserService';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let userId: string;
  let testUser: User;
  let testEmail: string;
  let testPassword: string;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    userService = new UserService(mockUserRepository);

    userId = 'user123';
    testEmail = 'test@example.com';
    testPassword = 'password123';

    testUser = User.create({
      email: testEmail,
      password: testPassword,
    });
    Object.defineProperty(testUser, 'id', { value: userId });
  });

  describe('createUser', () => {
    beforeEach(() => {
      mockUserRepository.save.mockResolvedValue(testUser);
    });

    it('should create a user successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await userService.createUser(testEmail, testPassword);

      expect(result).toEqual({
        id: testUser.id,
        email: testUser.getEmail(),
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(testEmail);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const existingUser = User.create({
        email: testEmail,
        password: testPassword,
      });

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(userService.createUser(testEmail, testPassword)).rejects.toThrow(
        'Email already in use',
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      mockUserRepository.findById.mockResolvedValue(testUser);

      const result = await userService.getUserById(userId);

      expect(result).toEqual({
        id: testUser.id,
        email: testUser.getEmail(),
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById('non-existent')).rejects.toThrow('User not found');
    });
  });

  describe('getUserByEmail', () => {
    it('should return user if found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(testUser);

      const result = await userService.getUserByEmail(testEmail);

      expect(result).toEqual({
        id: testUser.id,
        email: testUser.getEmail(),
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(testEmail);
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.getUserByEmail('non-existent@example.com')).rejects.toThrow(
        'User not found',
      );
    });
  });
});

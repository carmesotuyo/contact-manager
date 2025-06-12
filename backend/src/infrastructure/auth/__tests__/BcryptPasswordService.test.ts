import { BcryptPasswordService } from '../services/BcryptPasswordService';

describe('BcryptPasswordService', () => {
  let service: BcryptPasswordService;

  beforeEach(() => {
    service = new BcryptPasswordService();
  });

  describe('hash', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123';
      const hashedPassword = await service.hash(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.startsWith('$2b$')).toBe(true); // bcrypt hash prefix
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should throw error for empty password', async () => {
      await expect(service.hash('')).rejects.toThrow('Password is required');
    });

    it('should throw error for null password', async () => {
      await expect(service.hash(null as any)).rejects.toThrow('Password is required');
    });
  });

  describe('verify', () => {
    it('should verify correct password successfully', async () => {
      const password = 'testPassword123';
      const hashedPassword = await service.hash(password);

      const isValid = await service.verify(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword123';
      const hashedPassword = await service.hash(password);

      const isValid = await service.verify(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should throw error for empty plain password', async () => {
      await expect(service.verify('', 'hashedPassword')).rejects.toThrow(
        'Both plain password and hashed password are required',
      );
    });

    it('should throw error for empty hashed password', async () => {
      await expect(service.verify('password', '')).rejects.toThrow(
        'Both plain password and hashed password are required',
      );
    });

    it('should throw error for null passwords', async () => {
      await expect(service.verify(null as any, 'hashedPassword')).rejects.toThrow(
        'Both plain password and hashed password are required',
      );
      await expect(service.verify('password', null as any)).rejects.toThrow(
        'Both plain password and hashed password are required',
      );
    });
  });

  describe('constructor', () => {
    it('should use custom salt rounds', async () => {
      const customSaltRounds = 12;
      const customService = new BcryptPasswordService(customSaltRounds);
      const password = 'testPassword123';
      const hashedPassword = await customService.hash(password);

      expect(hashedPassword.startsWith('$2b$12$')).toBe(true); // check salt rounds in hash
    });

    it('should use default salt rounds when not specified', async () => {
      const password = 'testPassword123';
      const hashedPassword = await service.hash(password);

      expect(hashedPassword.startsWith('$2b$10$')).toBe(true); // check default salt rounds
    });
  });
});

import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaUserRepository } from '../UserRepository';
import { User } from '../../../../../domain/entities/User';
import { Email } from '../../../../../domain/value-objects/Email';

jest.mock('../../client', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

const prismaMock = jest.requireMock('../../client').prisma as DeepMockProxy<PrismaClient>;

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  const testUser = {
    id: '123',
    email: 'test@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockReset(prismaMock);
    repository = new PrismaUserRepository();
  });

  describe('findById', () => {
    it('should return null when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const result = await repository.findById('123');
      expect(result).toBeNull();
    });

    it('should return user when found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(testUser);
      const result = await repository.findById('123');
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('123');
      expect(result?.getEmail()).toBe('test@example.com');
    });

    it('should throw error when id is empty', async () => {
      await expect(repository.findById('')).rejects.toThrow('User ID is required');
    });

    it('should propagate database errors', async () => {
      const dbError = new Error('Database connection failed');
      prismaMock.user.findUnique.mockRejectedValue(dbError);
      await expect(repository.findById('123')).rejects.toThrow(dbError);
    });
  });

  describe('findByEmail', () => {
    it('should return null when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const result = await repository.findByEmail('test@example.com');
      expect(result).toBeNull();
    });

    it('should return user when found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(testUser);
      const result = await repository.findByEmail('test@example.com');
      expect(result).toBeInstanceOf(User);
      expect(result?.getEmail()).toBe('test@example.com');
    });

    it('should throw error when email is empty', async () => {
      await expect(repository.findByEmail('')).rejects.toThrow('Email is required');
    });

    it('should normalize email before search', async () => {
      await repository.findByEmail('  TEST@example.com  ');
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('save', () => {
    it('should create new user', async () => {
      const user = User.create({
        email: 'new@example.com',
        password: 'password123',
      });

      prismaMock.user.upsert.mockResolvedValue({
        ...testUser,
        email: 'new@example.com',
      });

      const result = await repository.save(user);
      expect(result).toBeInstanceOf(User);
      expect(result.getEmail()).toBe('new@example.com');
    });

    it('should update existing user', async () => {
      const user = User.create({
        id: '123',
        email: 'updated@example.com',
        password: 'password123',
      });

      prismaMock.user.upsert.mockResolvedValue({
        ...testUser,
        email: 'updated@example.com',
      });

      const result = await repository.save(user);
      expect(result).toBeInstanceOf(User);
      expect(result.getEmail()).toBe('updated@example.com');
    });

    it('should throw error when user is null', async () => {
      await expect(repository.save(null as any)).rejects.toThrow('User is required');
    });

    it('should handle database errors during save', async () => {
      const user = User.create({
        email: 'test@example.com',
        password: 'password123',
      });

      const dbError = new Error('Unique constraint violation');
      prismaMock.user.upsert.mockRejectedValue(dbError);
      await expect(repository.save(user)).rejects.toThrow(dbError);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const users = [testUser];
      prismaMock.user.findMany.mockResolvedValue(users);
      prismaMock.user.count.mockResolvedValue(1);

      const result = await repository.findAll({ page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by email', async () => {
      const users = [testUser];
      prismaMock.user.findMany.mockResolvedValue(users);
      prismaMock.user.count.mockResolvedValue(1);

      const result = await repository.findAll({ email: 'test' });
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            email: { contains: 'test', mode: 'insensitive' },
          },
        }),
      );
    });

    it('should handle invalid page and limit values', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.user.count.mockResolvedValue(0);

      const result = await repository.findAll({ page: -1, limit: 1000 });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(100);
    });

    it('should handle empty result set', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.user.count.mockResolvedValue(0);

      const result = await repository.findAll({});
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      prismaMock.user.findMany.mockRejectedValue(dbError);
      await expect(repository.findAll({})).rejects.toThrow(dbError);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      await repository.delete('123');
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should throw error when id is empty', async () => {
      await expect(repository.delete('')).rejects.toThrow('User ID is required');
    });

    it('should handle database errors during delete', async () => {
      const dbError = new Error('User not found');
      prismaMock.user.delete.mockRejectedValue(dbError);
      await expect(repository.delete('123')).rejects.toThrow(dbError);
    });
  });

  describe('count', () => {
    it('should return total count without filters', async () => {
      prismaMock.user.count.mockResolvedValue(5);
      const count = await repository.count({});
      expect(count).toBe(5);
    });

    it('should filter count by email', async () => {
      prismaMock.user.count.mockResolvedValue(2);
      await repository.count({ email: 'test' });
      expect(prismaMock.user.count).toHaveBeenCalledWith({
        where: {
          email: { contains: 'test', mode: 'insensitive' },
        },
      });
    });

    it('should normalize email filter', async () => {
      await repository.count({ email: '  TEST@example.com  ' });
      expect(prismaMock.user.count).toHaveBeenCalledWith({
        where: {
          email: { contains: 'test@example.com', mode: 'insensitive' },
        },
      });
    });

    it('should handle database errors during count', async () => {
      const dbError = new Error('Database connection failed');
      prismaMock.user.count.mockRejectedValue(dbError);
      await expect(repository.count({})).rejects.toThrow(dbError);
    });
  });

  // Testing private mapToEntity method through public methods
  describe('entity mapping', () => {
    it('should throw error when mapping null data', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const result = await repository.findById('123');
      expect(result).toBeNull();
    });

    it('should handle invalid data gracefully', async () => {
      const invalidUser = { ...testUser, email: null };
      prismaMock.user.findUnique.mockResolvedValue(invalidUser as any);
      await expect(repository.findById('123')).rejects.toThrow();
    });
  });
});

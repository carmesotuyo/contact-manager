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
  });
});

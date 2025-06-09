import { User } from '../../../../domain/entities/User';
import { IUserRepository, UserSearchCriteria } from '../../../../domain/ports/IUserRepository';
import { SearchResult } from '../../../../domain/ports/IBaseRepository';
import { prisma } from '../client';
import { Email } from '../../../../domain/value-objects/Email';

type PrismaUser = {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      return user ? this.mapToEntity(user) : null;
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      return user ? this.mapToEntity(user) : null;
    } catch (error) {
      throw error;
    }
  }

  async save(user: User): Promise<User> {
    try {
      if (!user) {
        throw new Error('User is required');
      }

      const data = {
        id: user.id,
        email: user.getEmail(),
        password: user.getHashedPassword(),
      };

      const saved = await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: data.email,
          password: data.password,
        },
        create: {
          id: data.id,
          email: data.email,
          password: data.password,
        },
      });

      return this.mapToEntity(saved);
    } catch (error) {
      throw error;
    }
  }

  async findAll(criteria: UserSearchCriteria): Promise<SearchResult<User>> {
    try {
      const { email, page = 1, limit = 10 } = criteria;
      const validPage = Math.max(1, page);
      const validLimit = Math.max(1, Math.min(100, limit));
      const skip = (validPage - 1) * validLimit;

      const where = email
        ? {
            email: { contains: email.trim().toLowerCase(), mode: 'insensitive' as const },
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: validLimit,
          orderBy: { email: 'asc' },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        items: users ? users.map((user: PrismaUser) => this.mapToEntity(user)) : [],
        total,
        page: validPage,
        limit: validLimit,
      };
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }

      await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  async count(criteria: UserSearchCriteria): Promise<number> {
    try {
      const { email } = criteria;
      const where = email
        ? {
            email: { contains: email.trim().toLowerCase(), mode: 'insensitive' as const },
          }
        : {};

      const count = await prisma.user.count({ where });
      return count;
    } catch (error) {
      throw error;
    }
  }

  private mapToEntity(data: PrismaUser): User {
    if (!data) {
      throw new Error('Cannot map null or undefined data to User entity');
    }

    return User.create({
      id: data.id,
      email: data.email,
      password: data.password,
    });
  }
}

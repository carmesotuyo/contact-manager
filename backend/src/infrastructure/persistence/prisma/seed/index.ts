import { prisma } from '../client';
import { UserSeeder } from './UserSeeder';
import { UserService } from '../../../../application/services/UserService';
import { PrismaUserRepository } from '../repositories/UserRepository';
import { BcryptPasswordService } from '../../../auth/services/BcryptPasswordService';

async function main() {
  try {
    const userRepository = new PrismaUserRepository();
    const passwordService = new BcryptPasswordService();
    const userService = new UserService(userRepository, passwordService);

    const userSeeder = new UserSeeder(userService);
    await userSeeder.seed();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

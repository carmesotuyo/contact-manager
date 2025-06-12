import { seedUsers } from './data';
import { IUserService } from '../../../../application/ports/IUserService';

export class UserSeeder {
  constructor(private readonly userService: IUserService) {}

  async seed(): Promise<void> {
    console.log('🌱 Seeding users...');

    for (const userData of seedUsers) {
      try {
        await this.userService.createUser(userData.email, userData.password);
        console.log(`✅ Created user: ${userData.email}`);
      } catch (error) {
        if (error instanceof Error && error.message === 'Email already in use') {
          console.log(`⏭️  Skipping existing user: ${userData.email}`);
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error);
        }
      }
    }

    console.log('✨ User seeding completed!');
  }
}

import { User, UserData } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { UserResponseDTO } from '../dtos/users.dto';
import { IUserService } from '../ports/IUserService';

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  private mapUserToDTO(user: User): UserResponseDTO {
    const json = user.toJSON();
    return {
      id: json.id,
      email: json.email,
    };
  }

  async createUser(email: string, password: string): Promise<UserResponseDTO> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const userData: UserData = {
      email,
      password,
    };

    const user = User.create(userData);
    const savedUser = await this.userRepository.save(user);
    return this.mapUserToDTO(savedUser);
  }

  async getUserById(id: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return this.mapUserToDTO(user);
  }

  async getUserByEmail(email: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    return this.mapUserToDTO(user);
  }
}

import { IAuthenticationService, AuthenticationResult } from '../ports/IAuthenticationService';
import { IPasswordService } from '../../domain/ports/IPasswordService';
import { ITokenService } from '../../domain/ports/ITokenService';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { User } from '../../domain/entities/User';

export class AuthenticationService implements IAuthenticationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly tokenService: ITokenService,
  ) {}

  async authenticate(email: string, password: string): Promise<AuthenticationResult> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await this.passwordService.verify(password, user.getPassword());
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = await this.generateToken(user);

    return {
      user,
      token,
    };
  }

  async verifyToken(token: string): Promise<User> {
    if (!token) {
      throw new Error('Token is required');
    }

    const payload = await this.tokenService.verify(token);
    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.getEmail() !== payload.email) {
      throw new Error('Invalid token');
    }

    return user;
  }

  async generateToken(user: User): Promise<string> {
    if (!user) {
      throw new Error('User is required');
    }

    return this.tokenService.generate({
      userId: user.id,
      email: user.getEmail(),
    });
  }
}

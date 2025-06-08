import bcrypt from 'bcrypt';
import { IPasswordService } from '../../../domain/ports/IPasswordService';

export class BcryptPasswordService implements IPasswordService {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  async hash(password: string): Promise<string> {
    if (!password) {
      throw new Error('Password is required');
    }
    return bcrypt.hash(password, this.saltRounds);
  }

  async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
      throw new Error('Both plain password and hashed password are required');
    }
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

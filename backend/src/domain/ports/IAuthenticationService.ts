import { User } from '../entities/User';

export interface AuthenticationResult {
  user: User;
  token: string;
}

export interface IAuthenticationService {
  authenticate(email: string, password: string): Promise<AuthenticationResult>;
  verifyToken(token: string): Promise<User>;
  generateToken(user: User): Promise<string>;
}

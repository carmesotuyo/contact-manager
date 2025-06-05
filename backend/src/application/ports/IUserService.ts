import { UserResponseDTO } from '../dtos/users.dto';

export interface IUserService {
  createUser(email: string, password: string): Promise<UserResponseDTO>;
  getUserById(id: string): Promise<UserResponseDTO>;
  getUserByEmail(email: string): Promise<UserResponseDTO>;
}

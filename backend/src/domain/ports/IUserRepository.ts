import { User } from '../entities/User';
import { BaseSearchCriteria, IBaseRepository } from './IBaseRepository';

export interface UserSearchCriteria extends BaseSearchCriteria {
  email?: string;
}

export interface IUserRepository extends IBaseRepository<User, UserSearchCriteria> {
  findByEmail(email: string): Promise<User | null>;
}

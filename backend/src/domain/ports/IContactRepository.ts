import { Contact } from '../entities/Contact';
import { BaseSearchCriteria, IBaseRepository } from './IBaseRepository';

export interface ContactSearchCriteria extends BaseSearchCriteria {
  userId?: string;
  query?: string;
}

export interface IContactRepository extends IBaseRepository<Contact, ContactSearchCriteria> {
  findByEmail(email: string): Promise<Contact | null>;
  findByUserId(userId: string): Promise<Contact[]>;
}

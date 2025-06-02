import { Contact } from '../entities/Contact';

export interface ContactSearchCriteria {
  userId?: string;
  name?: string;
  email?: string;
  page?: number;
  limit?: number;
}

export interface IContactRepository {
  findAll(criteria: ContactSearchCriteria): Promise<Contact[]>;
  findById(id: string): Promise<Contact | null>;
  findByEmail(email: string): Promise<Contact | null>;
  save(contact: Contact): Promise<Contact>;
  delete(id: string): Promise<void>;
  count(criteria: ContactSearchCriteria): Promise<number>;
}

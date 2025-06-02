import { Contact } from '../entities/Contact';

export interface ContactSearchCriteria {
  userId?: string;
  query?: string;
  page?: number;
  limit?: number;
}

export interface ContactSearchResult {
  items: Contact[];
  total: number;
  page: number;
  limit: number;
}

export interface IContactRepository {
  findAll(criteria: ContactSearchCriteria): Promise<ContactSearchResult>;
  findById(id: string): Promise<Contact | null>;
  findByEmail(email: string): Promise<Contact | null>;
  save(contact: Contact): Promise<Contact>;
  delete(id: string): Promise<void>;
  count(criteria: ContactSearchCriteria): Promise<number>;
}

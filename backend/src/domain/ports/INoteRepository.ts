import { Note } from '../entities/Note';
import { BaseSearchCriteria, IBaseRepository } from './IBaseRepository';

export interface NoteSearchCriteria extends BaseSearchCriteria {
  userId?: string;
  contactId?: string;
}

export interface INoteRepository extends IBaseRepository<Note, NoteSearchCriteria> {
  findByContactId(contactId: string): Promise<Note[]>;
  findByUserId(userId: string): Promise<Note[]>;
  deleteByContactId(contactId: string): Promise<void>;
}

import { Note } from '../entities/Note';

export interface NoteSearchCriteria {
  userId?: string;
  contactId?: string;
  page?: number;
  limit?: number;
}

export interface NoteSearchResult {
  items: Note[];
  total: number;
  page: number;
  limit: number;
}

export interface INoteRepository {
  findAll(criteria: NoteSearchCriteria): Promise<NoteSearchResult>;
  findById(id: string): Promise<Note | null>;
  findByContactId(contactId: string): Promise<Note[]>;
  save(note: Note): Promise<Note>;
  delete(id: string): Promise<void>;
  deleteByContactId(contactId: string): Promise<void>;
}

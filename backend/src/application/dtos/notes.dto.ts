import { SearchResult } from '../../domain/ports/IBaseRepository';

export interface CreateNoteDTO {
  userId: string;
  contactId: string;
  text: string;
}

export interface UpdateNoteDTO {
  text: string;
}

export interface NoteSearchDTO {
  userId?: string;
  contactId?: string;
  page?: number;
  limit?: number;
}

export interface NoteResponseDTO {
  id: string;
  userId: string;
  contactId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteListResponseDTO {
  items: NoteResponseDTO[];
  total: number;
  page: number;
  limit: number;
}

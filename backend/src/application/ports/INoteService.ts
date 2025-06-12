import {
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteSearchDTO,
  NoteResponseDTO,
  NoteListResponseDTO,
} from '../dtos/notes.dto';
import { Note } from '../../domain/entities/Note';
import { SearchResult } from '../../domain/ports/IBaseRepository';

export interface INoteService {
  createNote(data: CreateNoteDTO): Promise<NoteResponseDTO>;
  updateNote(id: string, userId: string, data: UpdateNoteDTO): Promise<NoteResponseDTO>;
  deleteNote(id: string, userId: string): Promise<void>;
  getNotesByContact(
    contactId: string,
    userId: string,
    criteria?: NoteSearchDTO,
  ): Promise<NoteListResponseDTO>;
  getNotesByUser(userId: string, criteria?: NoteSearchDTO): Promise<NoteListResponseDTO>;
  searchNotes(criteria: NoteSearchDTO): Promise<NoteListResponseDTO>;
}

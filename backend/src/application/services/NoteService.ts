import { Note } from '../../domain/entities/Note';
import { INoteRepository } from '../../domain/ports/INoteRepository';
import { IContactRepository } from '../../domain/ports/IContactRepository';
import {
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteSearchDTO,
  NoteResponseDTO,
  NoteListResponseDTO,
} from '../dtos/notes.dto';
import { INoteService } from '../ports/INoteService';

export class NoteService implements INoteService {
  constructor(
    private readonly noteRepository: INoteRepository,
    private readonly contactRepository: IContactRepository,
  ) {}

  private mapNoteToDTO(note: Note): NoteResponseDTO {
    const json = note.toJSON();
    return {
      id: json.id,
      userId: json.userId,
      contactId: json.contactId,
      text: json.text,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
    };
  }

  async createNote(data: CreateNoteDTO): Promise<NoteResponseDTO> {
    const contact = await this.contactRepository.findById(data.contactId);
    if (!contact || contact.getUserId() !== data.userId) {
      throw new Error('Contact not found');
    }

    const note = Note.create(data);
    const savedNote = await this.noteRepository.save(note);
    return this.mapNoteToDTO(savedNote);
  }

  async updateNote(id: string, userId: string, data: UpdateNoteDTO): Promise<NoteResponseDTO> {
    const note = await this.noteRepository.findById(id);
    if (!note || note.getUserId() !== userId) {
      throw new Error('Note not found');
    }

    note.updateText(data.text);
    const updatedNote = await this.noteRepository.save(note);
    return this.mapNoteToDTO(updatedNote);
  }

  async deleteNote(id: string, userId: string): Promise<void> {
    const note = await this.noteRepository.findById(id);
    if (!note || note.getUserId() !== userId) {
      throw new Error('Note not found');
    }

    await this.noteRepository.delete(id);
  }

  async getNotesByContact(
    contactId: string,
    userId: string,
    criteria: NoteSearchDTO = {},
  ): Promise<NoteListResponseDTO> {
    const contact = await this.contactRepository.findById(contactId);
    if (!contact || contact.getUserId() !== userId) {
      throw new Error('Contact not found');
    }

    const result = await this.noteRepository.findAll({
      contactId,
      page: criteria.page || 1,
      limit: criteria.limit || 20,
    });

    return {
      items: result.items.map((note) => this.mapNoteToDTO(note)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  async getNotesByUser(userId: string, criteria: NoteSearchDTO = {}): Promise<NoteListResponseDTO> {
    const result = await this.noteRepository.findAll({
      userId,
      page: criteria.page || 1,
      limit: criteria.limit || 20,
      ...criteria,
    });

    return {
      items: result.items.map((note) => this.mapNoteToDTO(note)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  async searchNotes(criteria: NoteSearchDTO): Promise<NoteListResponseDTO> {
    const result = await this.noteRepository.findAll({
      ...criteria,
      page: criteria.page || 1,
      limit: criteria.limit || 20,
    });

    return {
      items: result.items.map((note) => this.mapNoteToDTO(note)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}

import { Note } from '../../../../domain/entities/Note';
import { NoteData } from '../../../../domain/entities/Note';
import { INoteRepository, NoteSearchCriteria } from '../../../../domain/ports/INoteRepository';
import { SearchResult } from '../../../../domain/ports/IBaseRepository';
import { prisma } from '../client';

type PrismaNote = {
  id: string;
  userId: string;
  contactId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
};

type PersistedNoteData = Required<NoteData>;

export class PrismaNoteRepository implements INoteRepository {
  async findById(id: string): Promise<Note | null> {
    try {
      if (!id) {
        throw new Error('Note ID is required');
      }

      const note = await prisma.note.findUnique({
        where: { id },
      });

      return note ? this.mapToEntity(note) : null;
    } catch (error) {
      throw error;
    }
  }

  async findByContactId(contactId: string): Promise<Note[]> {
    try {
      if (!contactId) {
        throw new Error('Contact ID is required');
      }

      const notes = await prisma.note.findMany({
        where: { contactId },
      });

      return notes ? notes.map((note: PrismaNote) => this.mapToEntity(note)) : [];
    } catch (error) {
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Note[]> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const notes = await prisma.note.findMany({
        where: { userId },
      });

      return notes ? notes.map((note: PrismaNote) => this.mapToEntity(note)) : [];
    } catch (error) {
      throw error;
    }
  }

  async save(note: Note): Promise<Note> {
    try {
      if (!note) {
        throw new Error('Note is required');
      }

      const data = {
        id: note.id,
        contactId: note.getContactId(),
        userId: note.getUserId(),
        text: note.getText(),
      };

      const saved = await prisma.note.upsert({
        where: { id: note.id },
        update: data,
        create: data,
      });

      return this.mapToEntity(saved);
    } catch (error) {
      throw error;
    }
  }

  async findAll(criteria: NoteSearchCriteria): Promise<SearchResult<Note>> {
    try {
      const { userId, contactId, query, page = 1, limit = 10 } = criteria;
      const validPage = Math.max(1, page);
      const validLimit = Math.max(1, Math.min(100, limit));
      const skip = (validPage - 1) * validLimit;

      const where = {
        userId,
        ...(contactId && { contactId }),
        ...(query && { text: { contains: query, mode: 'insensitive' as const } }),
      };

      const [notes, total] = await Promise.all([
        prisma.note.findMany({
          where,
          skip,
          take: validLimit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.note.count({ where }),
      ]);

      return {
        items: notes ? notes.map((note: PrismaNote) => this.mapToEntity(note)) : [],
        total,
        page: validPage,
        limit: validLimit,
      };
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Note ID is required');
      }

      await prisma.note.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteByContactId(contactId: string): Promise<void> {
    try {
      if (!contactId) {
        throw new Error('Contact ID is required');
      }

      await prisma.note.deleteMany({
        where: { contactId },
      });
    } catch (error) {
      throw error;
    }
  }

  async count(criteria: NoteSearchCriteria): Promise<number> {
    try {
      const { userId, contactId, query } = criteria;
      const where = {
        userId,
        ...(contactId && { contactId }),
        ...(query && { text: { contains: query, mode: 'insensitive' as const } }),
      };

      return prisma.note.count({ where });
    } catch (error) {
      throw error;
    }
  }

  private mapToEntity(data: PrismaNote): Note {
    if (!data) {
      throw new Error('Cannot map null or undefined data to Note entity');
    }

    const persistedData: PersistedNoteData = {
      id: data.id,
      userId: data.userId,
      contactId: data.contactId,
      text: data.text,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    return Note.create(persistedData);
  }
}
